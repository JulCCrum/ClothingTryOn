"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePhoto } from "@/lib/db";

type PhotoAngle = "front" | "back" | "left" | "right";

const angles: { key: PhotoAngle; label: string; instruction: string; icon: string }[] = [
  { key: "front", label: "Front", instruction: "Face the camera directly", icon: "M12 4v16m0-16l-4 4m4-4l4 4" },
  { key: "back", label: "Back", instruction: "Turn around, back to camera", icon: "M12 20V4m0 16l-4-4m4 4l4-4" },
  { key: "left", label: "Left", instruction: "Turn left, show your side", icon: "M20 12H4m0 0l4-4m-4 4l4 4" },
  { key: "right", label: "Right", instruction: "Turn right, show your side", icon: "M4 12h16m0 0l-4-4m4 4l-4 4" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Record<PhotoAngle, File | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [currentAngle, setCurrentAngle] = useState<PhotoAngle>("front");
  const [uploading, setUploading] = useState(false);

  const completedCount = angles.filter((a) => photos[a.key]).length;
  const progress = (completedCount / 4) * 100;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotos((prev) => ({ ...prev, [currentAngle]: file }));
      const currentIndex = angles.findIndex((a) => a.key === currentAngle);
      if (currentIndex < angles.length - 1) {
        setCurrentAngle(angles[currentIndex + 1].key);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to process image: ${errorMsg}`);
    }
  };

  const handleContinue = async () => {
    const allPhotosUploaded = angles.every((angle) => photos[angle.key]);
    if (!allPhotosUploaded) {
      alert("Please upload all 4 photos to continue");
      return;
    }

    setUploading(true);

    try {
      for (const angle of angles) {
        const file = photos[angle.key];
        if (file) {
          await savePhoto(angle.key, file);
        }
      }
      router.push("/upload");
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to save photos: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const currentAngleData = angles.find((a) => a.key === currentAngle)!;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background glow */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />

      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-5xl sm:text-6xl mb-3">Upload Your Photos</h1>
          <p className="text-txt-secondary text-lg">
            We need 4 angles to create accurate try-ons
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 animate-fade-up stagger-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-txt-muted">{completedCount} of 4 photos</span>
            <span className="text-sm text-accent-light font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Angle selector pills */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 animate-fade-up stagger-2">
          {angles.map((angle) => {
            const isCompleted = !!photos[angle.key];
            const isActive = currentAngle === angle.key;
            return (
              <button
                key={angle.key}
                onClick={() => setCurrentAngle(angle.key)}
                className={`
                  relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${isCompleted
                    ? "bg-accent/15 text-accent-light border border-accent/30"
                    : isActive
                    ? "bg-white/[0.08] text-txt-primary border border-white/[0.15]"
                    : "bg-transparent text-txt-muted border border-white/[0.06] hover:border-white/[0.12]"
                  }
                `}
              >
                {isCompleted && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {angle.label}
              </button>
            );
          })}
        </div>

        {/* Upload card */}
        <div className="glass p-8 sm:p-10 animate-scale-in stagger-3">
          <div className="text-center space-y-6">
            {/* Angle info */}
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentAngleData.icon} />
                </svg>
                <h2 className="text-2xl font-semibold">{currentAngleData.label} View</h2>
              </div>
              <p className="text-txt-secondary">{currentAngleData.instruction}</p>
            </div>

            {photos[currentAngle] ? (
              <div className="space-y-4">
                <div className="relative w-56 h-80 sm:w-64 sm:h-96 mx-auto rounded-card overflow-hidden border border-white/[0.08]">
                  <img
                    src={URL.createObjectURL(photos[currentAngle]!)}
                    alt={`${currentAngle} view`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-medium bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {currentAngleData.label}
                  </span>
                </div>
                <button
                  onClick={() => setPhotos((prev) => ({ ...prev, [currentAngle]: null }))}
                  className="text-sm text-txt-muted hover:text-[var(--error)] transition-colors"
                >
                  Remove and retake
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="upload-zone w-56 h-80 sm:w-64 sm:h-96 mx-auto flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-txt-primary">
                        Tap to upload
                      </p>
                      <p className="text-xs text-txt-muted mt-1">
                        All formats supported
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Continue button */}
        <div className="flex justify-center mt-8 animate-fade-up stagger-4">
          <button
            onClick={handleContinue}
            disabled={uploading || completedCount < 4}
            className="btn-primary text-lg px-10 py-4"
          >
            {uploading ? (
              <>
                <span className="spinner" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
