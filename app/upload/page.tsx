"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllPhotos, clearAllPhotos, saveTryonResults } from "@/lib/db";

export default function UploadPage() {
  const router = useRouter();
  const [productUrl, setProductUrl] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hasPhotos, setHasPhotos] = useState(false);

  useEffect(() => {
    // Check if user has uploaded body photos from IndexedDB
    const checkPhotos = async () => {
      try {
        const photos = await getAllPhotos();
        const photoCount = Object.keys(photos).length;

        if (photoCount < 4) {
          router.push("/onboarding");
          return;
        }

        setHasPhotos(true);
      } catch (error) {
        console.error("Error checking photos:", error);
        router.push("/onboarding");
      }
    };

    checkPhotos();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Product file selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      // Accept all image files including HEIC
      // Server will handle HEIC conversion
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProductUrl(""); // Clear URL if image is uploaded
    } catch (error) {
      console.error("Error processing file:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to process image: ${errorMsg}`);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductUrl(e.target.value);
    if (e.target.value) {
      setProductImage(null);
      setImagePreview(null);
    }
  };

  const handleClearPhotos = async () => {
    if (confirm("This will delete your body photos. You'll need to re-upload them. Continue?")) {
      try {
        await clearAllPhotos();
        alert("Photos cleared! Redirecting to onboarding...");
        router.push("/onboarding");
      } catch (error) {
        console.error("Error clearing photos:", error);
        alert("Failed to clear photos");
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!productUrl && !productImage) {
      alert("Please provide a product URL or upload an image");
      return;
    }

    setGenerating(true);

    try {
      // Get user photos from IndexedDB
      const userPhotoFiles = await getAllPhotos();

      if (Object.keys(userPhotoFiles).length < 4) {
        throw new Error("User photos not found. Please upload photos first.");
      }

      // Convert Files to base64 for API
      const userPhotos: Record<string, string> = {};
      for (const [angle, file] of Object.entries(userPhotoFiles)) {
        userPhotos[angle] = await fileToBase64(file);
      }

      let productImageData = "";
      if (productImage) {
        productImageData = await fileToBase64(productImage);
      }

      // Call the API
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhotos,
          productUrl: productUrl || null,
          productImage: productImageData || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate try-on");
      }

      const data = await response.json();

      // Store results in IndexedDB (sessionStorage too small for images)
      await saveTryonResults(data.results);
      router.push("/results");
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate try-on. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!hasPhotos) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Add a Product</h1>
          <p className="text-gray-600">
            Paste a product link or upload a screenshot
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/product"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Screenshot
            </label>

            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Product"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => {
                    setProductImage(null);
                    setImagePreview(null);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-full h-64 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload product image
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || (!productUrl && !productImage)}
            className="w-full px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            {generating ? "Generating Try-On..." : "Generate Try-On"}
          </button>
        </div>

        {generating && (
          <div className="text-center text-gray-600">
            <p className="animate-pulse">
              This may take 10-15 seconds...
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleClearPhotos}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear body photos and re-upload
          </button>
        </div>
      </div>
    </div>
  );
}
