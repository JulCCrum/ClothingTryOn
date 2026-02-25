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
    const checkPhotos = async () => {
      try {
        const photos = await getAllPhotos();
        if (Object.keys(photos).length < 4) {
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

    try {
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProductUrl("");
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
      const userPhotoFiles = await getAllPhotos();

      if (Object.keys(userPhotoFiles).length < 4) {
        throw new Error("User photos not found. Please upload photos first.");
      }

      const userPhotos: Record<string, string> = {};
      for (const [angle, file] of Object.entries(userPhotoFiles)) {
        userPhotos[angle] = await fileToBase64(file);
      }

      let productImageData = "";
      if (productImage) {
        productImageData = await fileToBase64(productImage);
      }

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
      await saveTryonResults(data.results);
      router.push("/results");
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate try-on. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!hasPhotos) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background glow */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold/8 blur-[120px]" />

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-5xl sm:text-6xl mb-3">Add a Product</h1>
          <p className="text-txt-secondary text-lg">
            Paste a link or upload a clothing image
          </p>
        </div>

        {/* Main card */}
        <div className="glass p-8 sm:p-10 space-y-8 animate-scale-in stagger-1">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-txt-secondary">
              Product URL
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                value={productUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/product-image.jpg"
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs font-medium tracking-widest uppercase text-txt-muted">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-txt-secondary">
              Upload Image
            </label>

            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative w-full h-64 rounded-card overflow-hidden border border-white/[0.08]">
                  <img
                    src={imagePreview}
                    alt="Product"
                    className="w-full h-full object-contain bg-white/[0.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                <button
                  onClick={() => {
                    setProductImage(null);
                    setImagePreview(null);
                  }}
                  className="text-sm text-txt-muted hover:text-[var(--error)] transition-colors"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="upload-zone w-full h-52 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-txt-primary">Upload product image</p>
                      <p className="text-xs text-txt-muted mt-1">PNG, JPG, HEIC supported</p>
                    </div>
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
            className="btn-primary w-full text-lg py-4"
          >
            {generating ? (
              <>
                <span className="spinner" />
                Generating Try-On...
              </>
            ) : (
              <>
                Generate Try-On
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Loading state */}
        {generating && (
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-txt-secondary">
              AI is dressing you up — this takes about 15 seconds...
            </p>
          </div>
        )}

        {/* Clear photos link */}
        <div className="text-center mt-8 animate-fade-up stagger-3">
          <button
            onClick={handleClearPhotos}
            className="text-sm text-txt-muted hover:text-txt-secondary transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-white/25"
          >
            Clear body photos and re-upload
          </button>
        </div>
      </div>
    </div>
  );
}
