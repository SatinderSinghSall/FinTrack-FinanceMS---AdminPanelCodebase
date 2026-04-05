"use client";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f7f7f6] px-4 sm:px-6">
      {/* subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative w-full max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <div className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full border border-zinc-300 bg-white shadow-sm">
            FinTrack Admin
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight leading-tight">
          Admin panel is coming soon
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-600 leading-relaxed max-w-xl mx-auto">
          A modern control center for managing users, finances, and analytics —
          built for speed, clarity, and precision.
        </p>

        {/* Divider */}
        <div className="mt-6 w-12 sm:w-16 h-px bg-zinc-300 mx-auto" />

        {/* Features */}
        <div className="mt-6 sm:mt-8 space-y-2 text-xs sm:text-sm text-zinc-600">
          <p>Dashboard & real-time analytics</p>
          <p>User and transaction management</p>
          <p>Secure and scalable architecture</p>
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <button className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-black text-white text-xs sm:text-sm font-medium shadow-sm hover:bg-zinc-800 transition">
            Launching soon
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 sm:mt-14 text-[10px] sm:text-xs text-zinc-400">
          © {new Date().getFullYear()} FinTrack
        </p>
      </div>
    </div>
  );
}
