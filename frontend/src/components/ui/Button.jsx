import { motion } from 'framer-motion'
import { DURATION, EASE_OUT } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/*
  Button treatments taken from the reference PDFs:
   - `primary`  the red→pink gradient used for every CTA site-wide
                (Contact "Send", Service "Submit", Course "Enroll Now")
   - `onDark`   white-outlined button used on dark bands (hero "Free Demo")
   - `navy`     solid navy (navbar "Enquire", carousel arrows)
   - `quiet`    light bordered, for secondary actions such as retry
*/
const VARIANTS = {
  primary:
    'bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white shadow-[0_4px_16px_rgba(244,66,70,0.35)] hover:shadow-[0_6px_20px_rgba(244,66,70,0.45)] hover:brightness-105 disabled:opacity-50 cursor-pointer',
  secondary:
    'bg-gradient-to-r from-[#024D72] to-[#07405C] text-white shadow-md hover:shadow-lg hover:brightness-105 disabled:opacity-50 cursor-pointer',
  onDark:
    'border border-white/70 text-white hover:bg-white hover:text-[#101010] shadow-sm disabled:opacity-50 cursor-pointer',
  navy: 'bg-[#07405C] text-white hover:bg-[#024D72] shadow-sm disabled:opacity-50 cursor-pointer',
  outline:
    'border-2 border-[#07405C] text-[#07405C] hover:bg-[#07405C] hover:text-white shadow-xs disabled:opacity-50 cursor-pointer',
  quiet:
    'border border-slate-200 bg-white text-slate-800 hover:border-[#DF1E26] hover:text-[#DF1E26] shadow-xs disabled:opacity-50 cursor-pointer',
}

const SIZES = {
  sm: 'h-9 px-4 text-[0.8125rem]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-[0.9375rem]',
}

/**
 * The app's button. Always a real <button>, so Enter/Space, focus order and
 * disabled semantics come from the platform.
 *
 * Press feedback is scale + opacity only — both compositor properties.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  disabled = false,
  shimmer = false,
  ...props
}) {
  const reduced = useReducedMotion()

  const motionProps = reduced
    ? {}
    : {
        whileHover: disabled ? undefined : { scale: 1.02 },
        whileTap: disabled ? undefined : { scale: 0.97, opacity: 0.92 },
        transition: { duration: DURATION.tap, ease: EASE_OUT },
      }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={[
        'group relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold overflow-hidden',
        'transition-all duration-200 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...motionProps}
      {...props}
    >
      {shimmer && !reduced && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full pointer-events-none"
        />
      )}
      {children}
    </motion.button>
  )
}
