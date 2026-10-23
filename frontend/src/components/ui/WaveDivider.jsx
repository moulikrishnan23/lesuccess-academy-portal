import { useId } from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Fluid Animated SVG Wave and Tech Dividers between sections.
 * Features:
 * - Multi-layer floating waves with organic undulating physics
 * - Smooth blended gradients to eliminate harsh color boundaries
 * - Shimmering neon contour strokes
 * - Accessible fallback when prefers-reduced-motion is active
 */
export default function WaveDivider({
  type = "wave", // 'wave' | 'curve' | 'slant'
  fill = "#F5F8FC",
  gradientFrom,
  gradientVia,
  gradientTo,
  direction = "down", // 'down' (top to bottom transition) | 'up' (bottom to top)
  glow = true,
  animated = true,
  className = "",
}) {
  const reduced = useReducedMotion();
  const rawId = useId();
  const uid = rawId.replace(/:/g, "_");
  const fillGradId = `waveFillGrad_${uid}`;
  const glowGradId = `waveGlowGrad_${uid}`;

  const isFlip = direction === "up";
  const hasGradient = Boolean(gradientFrom && gradientTo);
  const activeFill = hasGradient ? `url(#${fillGradId})` : fill;

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
          className="w-full h-9 sm:h-14 md:h-18 lg:h-22 block"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Blended Section Fill Gradient */}
            {hasGradient && (
              <linearGradient
                id={fillGradId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={gradientFrom} />
                {gradientVia && <stop offset="50%" stopColor={gradientVia} />}
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            )}

            {/* Glowing Contour Stroke Gradient */}
            <linearGradient id={glowGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DF1E26" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#DF1E26" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Layer 1: Background Ambient Wave (Floating Depth) */}
          <motion.path
            d="M0,45 C280,20 480,65 720,38 C960,10 1180,60 1440,35 L1440,84 L0,84 Z"
            fill={activeFill}
            opacity="0.35"
            animate={
              reduced || !animated
                ? {}
                : {
                    d: [
                      "M0,45 C280,20 480,65 720,38 C960,10 1180,60 1440,35 L1440,84 L0,84 Z",
                      "M0,38 C260,60 500,25 720,50 C940,30 1160,20 1440,42 L1440,84 L0,84 Z",
                      "M0,45 C280,20 480,65 720,38 C960,10 1180,60 1440,35 L1440,84 L0,84 Z",
                    ],
                  }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Layer 2: Middle Floating Crest Wave */}
          <motion.path
            d="M0,38 C340,65 520,18 720,48 C920,75 1140,24 1440,52 L1440,84 L0,84 Z"
            fill={activeFill}
            opacity="0.6"
            animate={
              reduced || !animated
                ? {}
                : {
                    d: [
                      "M0,38 C340,65 520,18 720,48 C920,75 1140,24 1440,52 L1440,84 L0,84 Z",
                      "M0,48 C300,25 540,68 720,32 C900,16 1120,62 1440,38 L1440,84 L0,84 Z",
                      "M0,38 C340,65 520,18 720,48 C920,75 1140,24 1440,52 L1440,84 L0,84 Z",
                    ],
                  }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />

          {/* Layer 3: Foreground Main Wave with Seamless Blended Fill */}
          <motion.path
            d="M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48 L1440,84 L0,84 Z"
            fill={activeFill}
            animate={
              reduced || !animated
                ? {}
                : {
                    d: [
                      "M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48 L1440,84 L0,84 Z",
                      "M0,42 C300,16 520,72 720,36 C920,12 1140,70 1440,36 L1440,84 L0,84 Z",
                      "M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48 L1440,84 L0,84 Z",
                    ],
                  }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Glowing Animated Contour Stroke along the Wave Crest */}
          {glow && !reduced && (
            <motion.path
              d="M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48"
              stroke={`url(#${glowGradId})`}
              strokeWidth="2.5"
              fill="none"
              className="opacity-75"
              animate={
                !animated
                  ? {}
                  : {
                      d: [
                        "M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48",
                        "M0,42 C300,16 520,72 720,36 C920,12 1140,70 1440,36",
                        "M0,32 C320,78 480,10 720,44 C960,78 1120,16 1440,48",
                      ],
                      opacity: [0.65, 0.95, 0.65],
                    }
              }
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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
          {hasGradient && (
            <defs>
              <linearGradient
                id={fillGradId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={gradientFrom} />
                {gradientVia && <stop offset="50%" stopColor={gradientVia} />}
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
          )}
          <path
            d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z"
            fill={activeFill}
          />
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
          {hasGradient && (
            <defs>
              <linearGradient
                id={fillGradId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={gradientFrom} />
                {gradientVia && <stop offset="50%" stopColor={gradientVia} />}
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
          )}
          <path d="M0,48 L1440,0 L1440,48 Z" fill={activeFill} />
        </svg>
      )}
    </div>
  );
}
