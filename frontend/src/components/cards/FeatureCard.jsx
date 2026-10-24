import { motion } from "framer-motion";
import { fadeUp, motionSafe } from "../../animations/variants.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import BorderBeam from "../ui/BorderBeam.jsx";

/**
 * High-craft Feature / Service Card.
 * Engineered with 3D spotlight tilt, perimeter border beam, and interactive icon container.
 */
export default function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
  index = 0,
}) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      variants={motionSafe(fadeUp, reduced)}
      className={`h-full list-none ${className}`}
    >
      <SpotlightCard
        tilt={true}
        maxTilt={7}
        spotlightColor="rgba(223, 30, 38, 0.12)"
        data-cursor-text="Feature"
        className="group card-lift-3d relative flex h-full flex-col items-center rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 text-center shadow-xs transition-all duration-300 hover:border-[#07405C]/40 hover:shadow-2xl cursor-default"
      >
        <BorderBeam
          size={140}
          duration={8}
          delay={index * 1.5}
          colorFrom="#DF1E26"
          colorTo="#07405C"
        />

        {/* Top laser sheen line */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#DF1E26] via-[#F44246] to-[#07405C] opacity-30 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Icon Container with glowing background & interactive hover */}
        {Icon ? (
          <div
            aria-hidden="true"
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-r group-hover:from-[#F44246] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_8px_24px_rgba(244,66,70,0.35)]"
          >
            <Icon size={30} strokeWidth={1.75} />
          </div>
        ) : null}

        <h3 className="font-display text-base font-bold text-[#101010] leading-snug sm:text-lg transition-colors duration-200 group-hover:text-[#07405C]">
          {title}
        </h3>

        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
          {description}
        </p>
      </SpotlightCard>
    </motion.li>
  );
}
