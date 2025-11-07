import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import convert from "heic-convert";

// Convert HEIC base64 to JPEG base64
async function convertHeicToJpeg(base64Data: string): Promise<string> {
  try {
    // Extract the actual base64 data (remove data:image/...;base64, prefix if present)
    const base64Match = base64Data.match(/^data:image\/[^;]+;base64,(.+)$/);
    const pureBase64 = base64Match ? base64Match[1] : base64Data;

    // Convert base64 to Buffer
    const inputBuffer = Buffer.from(pureBase64, 'base64');

    // Check if it's a HEIC file by looking at the first bytes
    const header = inputBuffer.slice(0, 12).toString('hex');
    const isHeic = header.includes('66747970686569') || // 'ftypheic'
                   header.includes('6674797068656978') || // 'ftypheix'
                   header.includes('66747970686576') || // 'ftyphev'
                   header.includes('6674797068656d'); // 'ftyphem'

    if (!isHeic) {
      console.log("Not a HEIC file, returning original");
      return base64Data; // Return original if not HEIC
    }

    console.log("HEIC detected! Converting to JPEG on server...");

    // Convert HEIC to JPEG
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    });

    // Convert back to base64
    const jpegBase64 = Buffer.from(outputBuffer).toString('base64');
    const result = `data:image/jpeg;base64,${jpegBase64}`;

    console.log("HEIC successfully converted to JPEG on server!");
    return result;
  } catch (error) {
    console.error("Error converting HEIC:", error);
    // Return original if conversion fails
    return base64Data;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userPhotos, productUrl, productImage } = await request.json();

    if (!userPhotos) {
      return NextResponse.json(
        { error: "User photos are required" },
        { status: 400 }
      );
    }

    if (!productImage && !productUrl) {
      return NextResponse.json(
        { error: "Product image or URL is required" },
        { status: 400 }
      );
    }

    // Initialize Replicate
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "Replicate API token not configured" },
        { status: 500 }
      );
    }

    const replicate = new Replicate({
      auth: apiToken,
    });

    // Convert HEIC images to JPEG if needed
    console.log("Converting any HEIC images to JPEG...");
    const convertedUserPhotos: Record<string, string> = {};
    for (const [angle, photo] of Object.entries(userPhotos)) {
      convertedUserPhotos[angle] = await convertHeicToJpeg(photo);
    }

    // Handle product image - either from upload or URL
    let convertedProductImage: string;
    if (productImage) {
      convertedProductImage = await convertHeicToJpeg(productImage);
    } else if (productUrl) {
      // Fetch image from URL and convert to base64
      console.log("Fetching product image from URL:", productUrl);
      try {
        const response = await fetch(productUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          }
        });

        if (!response.ok) {
          let errorMessage = `Failed to fetch image from URL (${response.status} ${response.statusText}). `;

          if (response.status === 403) {
            errorMessage += "The website is blocking access. Try using a direct image URL (right-click image → 'Copy Image Address') or download and upload the image instead.";
          } else if (response.status === 404) {
            errorMessage += "The image was not found at this URL. Please check the URL and try again.";
          } else {
            errorMessage += "Please make sure you're using a direct image URL (ending in .jpg, .png, etc.) and not a product page URL.";
          }

          throw new Error(errorMessage);
        }

        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = blob.type || 'image/jpeg';
        convertedProductImage = `data:${mimeType};base64,${base64}`;
        console.log("Product image fetched and converted successfully");
      } catch (error) {
        console.error("Error fetching product URL:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch product image from URL";
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Product image or URL is required" },
        { status: 400 }
      );
    }

    // Process each angle with IDM-VTON
    const results = [];
    const angles = ["front", "back", "left", "right"];

    console.log("Starting virtual try-on generation...");

    for (const angle of angles) {
      if (!convertedUserPhotos[angle]) continue;

      try {
        console.log(`Processing ${angle} view...`);

        // Run IDM-VTON model
        const output = await replicate.run(
          "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
          {
            input: {
              human_img: convertedUserPhotos[angle],
              garm_img: convertedProductImage,
              garment_des: "a clothing item",
              is_checked: true,
              is_checked_crop: false,
              denoise_steps: 30,
              seed: 42,
            },
          }
        );

        console.log(`${angle} view generated successfully`);

        // IDM-VTON returns the image data as a stream
        // The output might be a stream, string, or object - we need to handle all cases
        let imageUrl: string | undefined;

        if (typeof output === 'string') {
          imageUrl = output;
        } else if (output && typeof output === 'object') {
          // Check if it's an async iterable (new SDK behavior)
          if (Symbol.asyncIterator in output) {
            console.log(`Processing async iterator for ${angle}...`);
            // Collect all binary chunks
            const chunks: Uint8Array[] = [];

            for await (const item of output as any) {
              // Replicate streams the actual image data as Uint8Array chunks
              if (item instanceof Uint8Array) {
                chunks.push(item);
              } else if (typeof item === 'string') {
                // Fallback: if it's a string, it might be a URL
                imageUrl = item;
                break;
              }
            }

            // If we collected binary chunks, combine them into a base64 data URL
            if (chunks.length > 0) {
              console.log(`${angle} - Collected ${chunks.length} binary chunks, combining...`);

              // Calculate total length
              const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

              // Combine all chunks
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }

              // Convert to base64
              const base64Image = Buffer.from(combined).toString('base64');
              imageUrl = `data:image/jpeg;base64,${base64Image}`;
              console.log(`${angle} - Successfully converted to base64 data URL (${base64Image.length} chars)`);
            }
          } else {
            // Try to get from output property
            imageUrl = (output as any)?.output || (output as any)?.url;
          }
        }

        console.log(`Final image URL for ${angle}:`, imageUrl ? 'Set successfully' : 'undefined');

        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
          try {
            console.log(`Fetching generated image for ${angle}...`);
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();
            const imageBuffer = await imageBlob.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const mimeType = imageBlob.type || 'image/png';
            imageUrl = `data:${mimeType};base64,${base64Image}`;
            console.log(`${angle} image converted to base64 for storage`);
          } catch (fetchError) {
            console.error(`Error fetching image for ${angle}:`, fetchError);
            // Fallback to original photo if fetch fails
            imageUrl = convertedUserPhotos[angle];
          }
        }

        results.push({
          angle,
          imageUrl: imageUrl || convertedUserPhotos[angle],
        });
      } catch (error) {
        console.error(`Error processing ${angle}:`, error);
        // Fallback to original photo if try-on fails
        results.push({
          angle,
          imageUrl: convertedUserPhotos[angle],
          error: "Failed to generate try-on for this angle",
        });
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any try-on images" },
        { status: 500 }
      );
    }

    console.log("Virtual try-on complete!");
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Try-on API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
