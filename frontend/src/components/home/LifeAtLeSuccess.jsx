import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const galleryImages = [
  "/images/gallery/gallery-1.png",
  "/images/gallery/gallery-2.png",
  "/images/gallery/gallery-3.png",
  "/images/gallery/gallery-6.png",
  "/images/gallery/gallery-4.png",
  "/images/gallery/gallery-5.png",
];

export default function LifeAtLeSuccess() {
  // Seamless loop: duplicate array for infinite marquee moving right
  const marqueeImages = [...galleryImages, ...galleryImages];

  return (
    <section className="relative h-[560px] sm:h-[620px] w-full overflow-hidden bg-slate-950">
      {/* Background Marquee Tracks moving towards the right */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-40 hover:opacity-50 transition-opacity">
        {/* Row 1 - Marquee moving to the right */}
        <div className="flex w-max animate-marquee-right">
          {marqueeImages.map((src, idx) => (
            <div
              key={`row1-${idx}`}
              className="mx-3 h-44 w-72 sm:h-56 sm:w-96 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-lg"
            >
              <img
                src={src}
                alt="LeSuccess Campus Life"
                className="h-full w-full object-cover object-top filter brightness-95 contrast-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Row 2 - Marquee moving to the right slightly offset */}
        <div className="flex w-max animate-marquee-right-slow">
          {marqueeImages.map((src, idx) => (
            <div
              key={`row2-${idx}`}
              className="mx-3 h-44 w-72 sm:h-56 sm:w-96 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-lg"
            >
              <img
                src={src}
                alt="LeSuccess Students and Activities"
                className="h-full w-full object-cover object-center filter brightness-95 contrast-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 z-10 pointer-events-none" />

      {/* SINGLE UNIFIED RESPONSIVE CONTENT CONTAINER (Fixes duplicate rendering bug) */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12 lg:px-16">
        <div className="max-w-2xl text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-[#ef334c]" />
            OUR GALLERY
          </div>

          <h2 className="text-3xl font-extrabold sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Life at <span className="text-[#ef334c]">LeSuccess</span>
          </h2>

          <p className="mt-5 text-base sm:text-xl text-gray-200 leading-relaxed max-w-xl">
            Build a strong foundation that empowers you to face real-world challenges
            and step into your tech career with clarity, practical confidence, and pride.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef334c] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d4273e] hover:gap-3"
            >
              Explore Full Gallery <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Inline styles for smooth marquee animation moving to the right */}
      <style>{`
        @keyframes marqueeScrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-marquee-right {
          animation: marqueeScrollRight 35s linear infinite;
        }
        .animate-marquee-right-slow {
          animation: marqueeScrollRight 45s linear infinite;
        }
        .animate-marquee-right:hover,
        .animate-marquee-right-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
