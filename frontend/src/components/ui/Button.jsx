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
    'bg-brand-gradient text-white shadow-[0_4px_14px_-4px_rgba(214,42,107,0.5)] hover:brightness-105 disabled:opacity-60',
  onDark:
    'border border-white/70 text-white hover:bg-white hover:text-navy-800 disabled:opacity-50',
  navy: 'bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-60',
  quiet:
    'border border-line-strong bg-white text-navy-800 hover:border-brand hover:text-brand disabled:opacity-50',
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
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-[filter,background-color,color,border-color] disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  )
}
