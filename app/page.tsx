import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          FitMirror
        </h1>

        <p className="text-xl text-gray-600">
          Try any outfit in seconds with AI
        </p>

        <p className="text-gray-500 max-w-md mx-auto">
          Upload your photos, paste a product link, and instantly see how clothes look on you.
        </p>

        <Link
          href="/onboarding"
          className="inline-block px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
        >
          Get Started
        </Link>

        <div className="pt-8 space-y-2 text-sm text-gray-400">
          <p>✓ Instant try-on</p>
          <p>✓ Multiple angles</p>
          <p>✓ Share with friends</p>
        </div>
      </div>
    </div>
  );
}
