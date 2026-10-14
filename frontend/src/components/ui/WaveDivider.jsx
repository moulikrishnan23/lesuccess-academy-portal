import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Fluid SVG Wave and Tech Dividers between sections.
 * Inspired by Fundaacps.org & Cloudious.
 * Replaces harsh straight section cuts with organic flowing curves and glowing light paths.
 */
export default function WaveDivider({
  type = "wave", // 'wave' | 'curve' | 'slant'
  fill = "#F5F8FC",
  direction = "down", // 'down' (top to bottom transition) | 'up' (bottom to top)
  glow = true,
  className = "",
}) {
  const reduced = useReducedMotion();

  const isFlip = direction === "up";

  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden leading-none pointer-events-none select-none z-10 ${
        isFlip ? "rotate-180" : ""
      } ${className}`}
    >
      {type === "wave" && (
        <svg
          viewBox="0 0 1440 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 sm:h-12 md:h-16 lg:h-20 block"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DF1E26" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DF1E26" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Fluid Wave Fill */}
          <path
            d="M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48 L1440,84 L0,84 Z"
            fill={fill}
          />

          {/* Glowing Contour Stroke */}
          {glow && !reduced && (
            <path
              d="M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48"
              stroke="url(#waveGlowGrad)"
              strokeWidth="2"
              fill="none"
              className="opacity-70"
            />
          )}
        </svg>
      )}

      {type === "curve" && (
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-6 sm:h-10 md:h-14 block"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill={fill} />
        </svg>
      )}

      {type === "slant" && (
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-5 sm:h-8 md:h-12 block"
          preserveAspectRatio="none"
        >
          <path d="M0,48 L1440,0 L1440,48 Z" fill={fill} />
        </svg>
      )}
    </div>
  );
}
