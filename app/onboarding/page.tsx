"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePhoto } from "@/lib/db";

type PhotoAngle = "front" | "back" | "left" | "right";

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

  const angles: { key: PhotoAngle; label: string; instruction: string }[] = [
    { key: "front", label: "Front", instruction: "Face the camera directly" },
    { key: "back", label: "Back", instruction: "Turn around, back to camera" },
    { key: "left", label: "Left", instruction: "Turn left, show your side" },
    { key: "right", label: "Right", instruction: "Turn right, show your side" },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      // Accept all image files including HEIC
      // Server will handle HEIC conversion
      console.log("Setting photo for angle:", currentAngle);
      setPhotos((prev) => ({ ...prev, [currentAngle]: file }));

      // Auto-advance to next angle
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
    // Check if all photos are uploaded
    const allPhotosUploaded = angles.every((angle) => photos[angle.key]);
    if (!allPhotosUploaded) {
      alert("Please upload all 4 photos to continue");
      return;
    }

    setUploading(true);

    try {
      // Save all photos to IndexedDB (supports large HEIC files)
      for (const angle of angles) {
        const file = photos[angle.key];
        if (file) {
          console.log(`Saving ${angle.key} photo to IndexedDB...`);
          await savePhoto(angle.key, file);
          console.log(`${angle.key} photo saved successfully`);
        }
      }

      console.log("All photos saved to IndexedDB!");
      router.push("/upload");
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to save photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const currentAngleData = angles.find((a) => a.key === currentAngle);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Upload Your Photos</h1>
          <p className="text-gray-600">
            We need 4 photos to create accurate try-ons
          </p>
          <p className="text-sm text-gray-500 mt-2">
            📸 All image formats supported (including HEIC from iPhone)
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-4">
          {angles.map((angle) => (
            <button
              key={angle.key}
              onClick={() => setCurrentAngle(angle.key)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                photos[angle.key]
                  ? "bg-green-500 text-white border-green-500"
                  : currentAngle === angle.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {angle.label}
            </button>
          ))}
        </div>

        {/* Current upload */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {currentAngleData?.label} View
              </h2>
              <p className="text-gray-600">{currentAngleData?.instruction}</p>
            </div>

            {photos[currentAngle] ? (
              <div className="space-y-4">
                <div className="relative w-64 h-96 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(photos[currentAngle]!)}
                    alt={`${currentAngle} view`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setPhotos((prev) => ({ ...prev, [currentAngle]: null }))}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove and retake
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-64 h-96 mx-auto border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
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
                      Click to upload
                    </p>
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
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={uploading || !angles.every((angle) => photos[angle.key])}
            className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            {uploading ? "Uploading..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
