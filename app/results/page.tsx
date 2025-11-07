"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTryonResults } from "@/lib/db";

type ResultImage = {
  angle: string;
  imageUrl: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ResultImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const resultsData = await getTryonResults();
        if (!resultsData) {
          router.push("/onboarding");
          return;
        }
        setResults(resultsData);
      } catch (error) {
        console.error("Failed to load results:", error);
        router.push("/onboarding");
      }
    };

    loadResults();
  }, [router]);

  const handleShare = async () => {
    setSharing(true);

    try {
      if (navigator.share && results[currentIndex]) {
        // Use native share if available
        await navigator.share({
          title: "My FitMirror Try-On",
          text: "Check out how this looks on me!",
          url: window.location.href,
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (results[currentIndex]) {
      try {
        const imageUrl = results[currentIndex].imageUrl;

        // If it's a data URL, we can download directly
        if (imageUrl.startsWith('data:')) {
          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = `fitmirror-${results[currentIndex].angle}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // If it's a regular URL, fetch it first and convert to blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `fitmirror-${results[currentIndex].angle}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
      } catch (error) {
        console.error("Download error:", error);
        alert("Failed to download image. Please try again.");
      }
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % results.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Your Try-On Results</h1>
          <p className="text-gray-600">
            Swipe through different angles
          </p>
        </div>

        {/* Carousel */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="relative">
            {/* Main Image */}
            <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={results[currentIndex].imageUrl}
                alt={`Try-on ${results[currentIndex].angle}`}
                className="w-full h-full object-contain"
              />

              {/* Navigation Arrows */}
              {results.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Angle Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {results[currentIndex].angle} view
              </div>
            </div>

            {/* Thumbnails */}
            {results.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-black scale-110"
                        : "border-gray-300 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={result.imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-white border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Download
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {sharing ? "Sharing..." : "Share"}
          </button>

          <Link
            href="/upload"
            className="px-6 py-3 bg-white border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Try Another
          </Link>
        </div>
      </div>
    </div>
  );
}
