import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../../animations/variants.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";

// Individual image configs matching the reference image layout and preserving subject faces
const row1Items = [
  {
    src: "/images/gallery/gallery-3.png",
    alt: "Signing Ceremony",
    widthClass: "w-72 sm:w-96 lg:w-[460px]",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-6.png",
    alt: "LeSuccess Team Leadership",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-4.png",
    alt: "Campus Celebration and Activities",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-5.png",
    alt: "Campus Academic Building",
    widthClass: "w-72 sm:w-96 lg:w-[460px]",
    posClass: "object-center",
  },
  {
    src: "/images/gallery/gallery-1.png",
    alt: "LeSuccess Faculty",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-2.png",
    alt: "Certification Ceremony",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
];

const row2Items = [
  {
    src: "/images/gallery/gallery-5.png",
    alt: "Campus Academic Building",
    widthClass: "w-72 sm:w-96 lg:w-[460px]",
    posClass: "object-center",
  },
  {
    src: "/images/gallery/gallery-1.png",
    alt: "LeSuccess Mentors and Faculty",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-2.png",
    alt: "Student Certification Ceremony",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-3.png",
    alt: "Signing Ceremony",
    widthClass: "w-72 sm:w-96 lg:w-[460px]",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-6.png",
    alt: "LeSuccess Team Leadership",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
  {
    src: "/images/gallery/gallery-4.png",
    alt: "Campus Celebration and Activities",
    widthClass: "w-52 sm:w-64 lg:w-72",
    posClass: "object-top",
  },
];

export default function LifeAtLeSuccess() {
  const reduced = useReducedMotion();
  // Seamless loop: duplicate array for infinite marquee moving right
  const marqueeRow1 = [...row1Items, ...row1Items];
  const marqueeRow2 = [...row2Items, ...row2Items];

  return (
    <section className="relative h-[480px] sm:h-[540px] lg:h-[580px] w-full overflow-hidden bg-[#07405C] bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#012f45]">
      {/* Background Marquee Tracks moving towards the right with edge-to-edge vertical coverage */}
      <div className="absolute inset-0 flex flex-col justify-between gap-1.5 sm:gap-2.5 opacity-90 sm:opacity-95 hover:opacity-100 transition-opacity duration-300">
        {/* Row 1 - Marquee moving to the right */}
        <div className="flex w-max flex-1 min-h-0 animate-marquee-right">
          {marqueeRow1.map((item, idx) => (
            <div
              key={`row1-${idx}`}
              className={`mx-1 sm:mx-1.5 h-full ${item.widthClass} shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-md`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-full w-full object-cover ${item.posClass} filter brightness-105 contrast-105 transition-transform duration-500 hover:scale-105`}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Row 2 - Marquee moving to the right slightly offset */}
        <div className="flex w-max flex-1 min-h-0 animate-marquee-right-slow">
          {marqueeRow2.map((item, idx) => (
            <div
              key={`row2-${idx}`}
              className={`mx-1 sm:mx-1.5 h-full ${item.widthClass} shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-md`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-full w-full object-cover ${item.posClass} filter brightness-105 contrast-105 transition-transform duration-500 hover:scale-105`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Brand navy gradient overlay: text contrast preserved on left, photos crystal clear on right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07405C]/95 via-[#07405C]/75 to-[#07405C]/20 z-10 pointer-events-none" />

      {/* SINGLE UNIFIED RESPONSIVE CONTENT CONTAINER */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-12 lg:px-16">
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="max-w-2xl text-white"
        >
          <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-[#DF1E26]" />
            OUR GALLERY
          </div>

          <h2 className="text-3xl font-extrabold sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Life at <span className="text-[#DF1E26]">LeSuccess</span>
          </h2>

          <p className="mt-3 sm:mt-5 text-sm sm:text-xl text-gray-200 leading-relaxed max-w-xl">
            Build a strong foundation that empowers you to face real-world challenges
            and step into your tech career with clarity, practical confidence, and pride.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-98"
            >
              <span>Explore Full Gallery</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
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
