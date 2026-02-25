import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/8 blur-[100px] animate-float stagger-3" />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      <div className="max-w-3xl text-center relative z-10">
        {/* Overline */}
        <div className="animate-fade-up stagger-1">
          <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-accent-light border border-accent/20 rounded-full mb-8 bg-accent/5">
            AI-Powered Virtual Fitting
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-7xl sm:text-8xl md:text-9xl leading-[0.9] tracking-tight mb-6 animate-fade-up stagger-2">
          <span className="block">Fit</span>
          <span className="block italic text-accent-light">Mirror</span>
        </h1>

        {/* Subhead */}
        <p className="text-xl sm:text-2xl text-txt-secondary max-w-lg mx-auto leading-relaxed mb-10 animate-fade-up stagger-3">
          Upload your photo. Pick any outfit.
          <br />
          <span className="text-txt-primary font-medium">See it on you — instantly.</span>
        </p>

        {/* CTA */}
        <div className="animate-fade-up stagger-4">
          <Link href="/onboarding" className="btn-primary text-lg px-10 py-4">
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-14 animate-fade-up stagger-5">
          {[
            "Instant Try-On",
            "4 Angles",
            "Any Clothing Item",
            "Share Results",
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 text-sm text-txt-secondary border border-white/[0.06] rounded-full bg-white/[0.02]"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-primary to-transparent" />
    </div>
  );
}
