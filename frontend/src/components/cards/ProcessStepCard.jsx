import { motion } from 'framer-motion'
import { cardHover, fadeUp, motionSafe } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * A numbered step in a process — "01 Evaluate", "02 Customize", and so on.
 *
 * Carries the brand gradient run corner to corner: the same two tokens as the
 * site's CTA buttons, at 135deg because a card is a large enough surface that
 * the button's horizontal fill reads as flat.
 *
 * Three things are deliberately decorative and hidden from assistive tech — the
 * numeral, the icon, and the dot field behind them. The step's meaning is its
 * title, and its position comes from the ordered list around it.
 *
 * @param {Function} icon A lucide-react icon component.
 */
export default function ProcessStepCard({
  step,
  icon: Icon,
  title,
  description,
  className = '',
}) {
  const reduced = useReducedMotion()

  return (
    <motion.li
      variants={motionSafe(fadeUp, reduced)}
      whileHover={reduced ? undefined : cardHover.hover}
      // One oversized corner rather than four equal ones, so the row of steps
      // reads as shaped rather than as four rectangles.
      className={`bg-brand-gradient-diagonal shadow-card relative flex h-full min-h-50 flex-col overflow-hidden rounded-xl rounded-tr-[2.5rem] p-6 text-white ${className}`}
    >
      {/* Faint node field, drawn in CSS so it costs no request. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 right-0 h-32 w-32 opacity-20 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:12px_12px]"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="font-display text-4xl leading-none font-bold text-white/45"
        >
          {step}
        </span>

        {Icon ? (
          <span aria-hidden="true" className="text-white">
            <Icon size={32} strokeWidth={1.5} />
          </span>
        ) : null}
      </div>

      <h3 className="relative mt-6 font-display text-xl font-bold text-white">{title}</h3>

      <p className="relative mt-3 text-sm leading-relaxed text-white/85">{description}</p>
    </motion.li>
  )
}
