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
        await navigator.share({
          title: "My FitMirror Try-On",
          text: "Check out how this looks on me!",
          url: window.location.href,
        });
      } else {
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
        if (imageUrl.startsWith("data:")) {
          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = `fitmirror-${results[currentIndex].angle}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `fitmirror-${results[currentIndex].angle}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
      } catch (error) {
        console.error("Download error:", error);
        alert("Failed to download image. Please try again.");
      }
    }
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % results.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);

  if (results.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-gold/6 blur-[100px]" />

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-5xl sm:text-6xl mb-3">Your Results</h1>
          <p className="text-txt-secondary text-lg">
            Swipe through your virtual try-on
          </p>
        </div>

        {/* Main carousel card */}
        <div className="glass p-4 sm:p-6 animate-scale-in stagger-1">
          <div className="relative">
            {/* Image */}
            <div className="relative w-full aspect-[3/4] max-h-[600px] rounded-card overflow-hidden bg-white/[0.02]">
              <img
                src={results[currentIndex].imageUrl}
                alt={`Try-on ${results[currentIndex].angle}`}
                className="w-full h-full object-contain"
              />

              {/* Gradient overlays */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Nav arrows */}
              {results.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Angle badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-sm font-medium capitalize">
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
                    className={`
                      relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300
                      ${index === currentIndex
                        ? "border-accent scale-105 ring-2 ring-accent/30"
                        : "border-white/[0.06] opacity-50 hover:opacity-80"
                      }
                    `}
                  >
                    <img
                      src={result.imageUrl}
                      alt={`${result.angle} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center mt-8 animate-fade-up stagger-3">
          <button onClick={handleDownload} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {sharing ? "Sharing..." : "Share"}
          </button>

          <Link href="/upload" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Another
          </Link>
        </div>
      </div>
    </div>
  );
}
