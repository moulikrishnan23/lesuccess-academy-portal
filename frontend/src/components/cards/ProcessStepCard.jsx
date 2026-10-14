import { motion } from "framer-motion";
import { fadeUp, floatLoop, motionSafe } from "../../animations/variants.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import BorderBeam from "../ui/BorderBeam.jsx";

/**
 * High-craft Numbered Process Step Card.
 * Engineered with 3D spotlight tilt, perimeter border beam, and tactile icon container.
 */
export default function ProcessStepCard({
  step,
  icon: Icon,
  title,
  description,
  floatDelay = 0,
  className = "",
}) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      variants={motionSafe(fadeUp, reduced)}
      className={`h-full list-none ${className}`}
    >
      <motion.div
        animate={reduced ? undefined : floatLoop(floatDelay)}
        className="h-full"
      >
        <SpotlightCard
          tilt={true}
          maxTilt={7}
          spotlightColor="rgba(255, 255, 255, 0.18)"
          data-cursor-text={`Step ${step}`}
          className="group card-lift-3d bg-brand-gradient-diagonal shadow-card relative flex h-full min-h-52 flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-7 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-[#CA164B]/40 cursor-default"
        >
          <BorderBeam
            size={160}
            duration={8}
            delay={floatDelay * 1.5}
            colorFrom="#ffffff"
            colorTo="#38bdf8"
          />

          {/* Top laser sheen line */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          />

          {/* Faint dot mesh pattern */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 right-0 h-32 w-32 opacity-20 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:12px_12px]"
          />

          <div>
            <div className="relative flex items-start justify-between gap-3">
              {Icon ? (
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white group-hover:text-[#DF1E26] group-hover:shadow-lg"
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
              ) : null}

              {/* Watermark Numeral */}
              <span
                aria-hidden="true"
                className="font-display text-4xl leading-none font-black text-white/35 drop-shadow-sm transition-all duration-300 group-hover:scale-115 group-hover:text-white/60"
              >
                {step}
              </span>
            </div>

            <h3 className="relative mt-5 font-display text-lg sm:text-xl font-bold text-white transition-colors duration-200">
              {title}
            </h3>

            <p className="relative mt-2 text-xs sm:text-sm leading-relaxed text-white/85">
              {description}
            </p>
          </div>
        </SpotlightCard>
      </motion.div>
    </motion.li>
  );
}
