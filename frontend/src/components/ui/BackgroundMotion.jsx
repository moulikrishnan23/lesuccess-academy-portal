import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../animations/variants.js'

/**
 * Floating subtle gradient orbs for ambient background motion.
 * Uses brand colors (#F44246 and #024D72) at 3%-7% opacity to add visual depth without distraction.
 * Automatically disables animation if user prefers reduced motion.
 */
export function FloatingOrbs({ variant = 'default', className = '' }) {
  const reduced = useReducedMotion()

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
          ease: 'easeInOut',
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
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#024D72]/10 to-[#07405C]/5 blur-3xl"
      />

      {/* Orb 3: Bottom accent glow */}
      {variant === 'full' && (
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
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-gradient-to-tr from-[#DF1E26]/8 to-[#07405C]/6 blur-3xl"
        />
      )}
    </div>
  )
}

/**
 * Subtle tech grid pattern for modern developer aesthetic.
 */
export function TechGrid({ className = '', opacity = 'opacity-[0.03]' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-[radial-gradient(#07405C_1px,transparent_1px)] [background-size:24px_24px] ${opacity} ${className}`}
    />
  )
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
  align = 'center',
  className = '',
}) {
  const reduced = useReducedMotion()

  const alignClass =
    align === 'center' ? 'text-center mx-auto' : align === 'left' ? 'text-left' : 'text-center mx-auto'

  const lineAlignClass =
    align === 'center' ? 'mx-auto' : align === 'left' ? 'mr-auto' : 'mx-auto'

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
        {titleHighlight && <span className="text-[#DF1E26]">{titleHighlight} </span>}
        {titleSuffix && <span>{titleSuffix}</span>}
      </h2>

      {/* Animated Accent Line */}
      <motion.div
        initial={reduced ? { width: 48, opacity: 1 } : { width: 0, opacity: 0 }}
        whileInView={{ width: 56, opacity: 1 }}
        viewport={ONCE_IN_VIEW}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        className={`my-3.5 h-1 rounded-full bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] ${lineAlignClass}`}
      />

      {description && (
        <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
          {description}
        </p>
      )}
    </motion.div>
  )
}
