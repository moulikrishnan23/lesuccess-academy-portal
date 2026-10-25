import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../../animations/redesignVariants.js";

/**
 * Floating subtle gradient orbs for ambient background motion.
 * Uses brand colors (#F44246 and #024D72) at 3%-7% opacity to add visual depth without distraction.
 * Automatically disables animation if user prefers reduced motion.
 */
export function FloatingOrbs({ variant = "default", className = "" }) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Orb 1: Primary brand red / crimson tint */}
      <motion.div
        animate={
          reduced
            ? {}
            : {
                x: [0, 25, 0, -20, 0],
                y: [0, -25, 15, 0],
                scale: [1, 1.08, 0.95, 1],
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-[#F44246]/10 to-[#CA164B]/5 blur-3xl"
      />

      {/* Orb 2: Deep navy / cyan tint */}
      <motion.div
        animate={
          reduced
            ? {}
            : {
                x: [0, -30, 15, 0],
                y: [0, 30, -20, 0],
                scale: [1, 0.94, 1.06, 1],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#024D72]/10 to-[#07405C]/5 blur-3xl"
      />

      {/* Orb 3: Bottom accent glow */}
      {variant === "full" && (
        <motion.div
          animate={
            reduced
              ? {}
              : {
                  x: [0, 15, -15, 0],
                  y: [0, -15, 10, 0],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-gradient-to-tr from-[#DF1E26]/8 to-[#07405C]/6 blur-3xl"
        />
      )}
    </div>
  );
}

/**
 * Subtle tech grid pattern for modern developer aesthetic.
 */
export function TechGrid({ className = "", opacity = "opacity-[0.03]" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-[radial-gradient(#07405C_1px,transparent_1px)] [background-size:24px_24px] ${opacity} ${className}`}
    />
  );
}

/**
 * Standardized Section Heading with Eyebrow, Animated Accent Line, and Typography Hierarchy.
 */
export function SectionHeading({
  badge,
  badgeIcon: BadgeIcon,
  titlePrefix,
  titleHighlight,
  titleSuffix,
  description,
  align = "center",
  className = "",
}) {
  const reduced = useReducedMotion();

  const alignClass =
    align === "center"
      ? "text-center mx-auto"
      : align === "left"
        ? "text-left"
        : "text-center mx-auto";

  const lineAlignClass =
    align === "center" ? "mx-auto" : align === "left" ? "mr-auto" : "mx-auto";

  return (
    <motion.div
      variants={motionSafe(fadeUp, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={ONCE_IN_VIEW}
      className={`max-w-3xl ${alignClass} ${className}`}
    >
      {badge && (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#07405C] mb-3">
          {BadgeIcon && <BadgeIcon size={14} className="text-[#07405C]" />}
          <span>{badge}</span>
        </div>
      )}

      <h2 className="text-3xl font-extrabold text-[#101010] sm:text-4xl tracking-tight leading-tight">
        {titlePrefix && <span>{titlePrefix} </span>}
        {titleHighlight && (
          <span className="text-[#DF1E26]">{titleHighlight} </span>
        )}
        {titleSuffix && <span>{titleSuffix}</span>}
      </h2>

      {/* Animated Accent Line */}
      <motion.div
        initial={reduced ? { width: 48, opacity: 1 } : { width: 0, opacity: 0 }}
        whileInView={{ width: 56, opacity: 1 }}
        viewport={ONCE_IN_VIEW}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className={`my-3.5 h-1 rounded-full bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] ${lineAlignClass}`}
      />

      {description && (
        <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
          {description}
        </p>
      )}
    </motion.div>
  );
}

const BADGE_COLORS = {
  brand: {
    bg: "bg-white/95 border-[#DF1E26]/25 shadow-[0_10px_25px_rgba(223,30,38,0.18)]",
    iconBg: "bg-[#DF1E26]/10 text-[#DF1E26]",
    dot: "bg-[#DF1E26]",
  },
  navy: {
    bg: "bg-white/95 border-[#07405C]/25 shadow-[0_10px_25px_rgba(7,64,92,0.18)]",
    iconBg: "bg-[#07405C]/10 text-[#07405C]",
    dot: "bg-[#07405C]",
  },
  emerald: {
    bg: "bg-white/95 border-emerald-500/25 shadow-[0_10px_25px_rgba(16,185,129,0.18)]",
    iconBg: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-white/95 border-amber-500/25 shadow-[0_10px_25px_rgba(245,158,11,0.18)]",
    iconBg: "bg-amber-50 text-amber-600",
    dot: "bg-amber-500",
  },
};

/**
 * Floating decorative tech badge inspired by Xplore IT Corp's floating cloudBob/SVGs.
 * Adds tactile depth and energetic micro-motion around heroes and key cards.
 */
export function FloatingTechBadge({
  icon: Icon,
  title,
  label,
  subtitle,
  className = "",
  delay = 0,
  duration = 4.5,
  yOffset = 10,
  accentColor = "brand", // 'brand' | 'navy' | 'emerald' | 'amber'
}) {
  const reduced = useReducedMotion();
  const colors = BADGE_COLORS[accentColor] || BADGE_COLORS.brand;
  const displayTitle = title || label || "";

  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === "string") {
      return (
        <img
          src={Icon}
          alt=""
          width="20"
          height="20"
          className="h-5 w-5 object-contain"
          loading="lazy"
        />
      );
    }
    const IconComponent = Icon;
    return <IconComponent size={18} />;
  };

  return (
    <motion.div
      animate={
        reduced
          ? {}
          : {
              y: [-yOffset / 2, yOffset / 2, -yOffset / 2],
              rotate: [-1, 1, -1],
            }
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 backdrop-blur-md transition-all hover:scale-105 select-none ${colors.bg} ${className}`}
    >
      {Icon && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs ${colors.iconBg}`}
        >
          {renderIcon()}
        </div>
      )}
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${colors.dot} animate-pulse`}
          />
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-none">
            {displayTitle}
          </h4>
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5 leading-none">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Pulsing glowing halo light source for section backgrounds (from Xplore IT Corp haloColor).
 */
export function GlowHalo({
  color = "#DF1E26",
  size = "320px",
  opacity = 0.18,
  className = "",
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
      }}
      className={`pointer-events-none absolute rounded-full blur-3xl animate-halo-pulse ${className}`}
    />
  );
}
