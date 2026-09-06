import { motion } from 'framer-motion'
import { cardHover, fadeUp, floatLoop, motionSafe } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * A numbered step in a process — "01 Evaluate", "02 Customize", and so on.
 *
 * Carries the brand gradient run corner to corner: the same two tokens as the
 * site's CTA buttons, at 135deg because a card is a large enough surface that
 * the button's horizontal fill reads as flat.
 *
 * Layout follows the reference: icon top-left, the step numeral top-right as a
 * faint watermark, then title and description stacked beneath.
 *
 * Three things are deliberately decorative and hidden from assistive tech — the
 * numeral, the icon, and the dot field behind them. The step's meaning is its
 * title, and its position comes from the ordered list around it.
 *
 * @param {Function} icon A lucide-react icon component.
 * @param {number} [floatDelay] Seconds to offset the idle drift, so a row of
 *   cards undulates instead of rising and falling in unison.
 */
export default function ProcessStepCard({
  step,
  icon: Icon,
  title,
  description,
  floatDelay = 0,
  className = '',
}) {
  const reduced = useReducedMotion()

  return (
    /*
      Two elements, each owning one transform. The <li> handles the scroll
      entrance and the hover lift; the inner surface handles the endless drift.
      Both animate `y`, so putting them on one node would mean the drift
      overwrote the entrance. It also has to carry the card's radius, or its
      hover shadow renders as a rectangle behind rounded corners.
    */
    <motion.li
      variants={motionSafe(fadeUp, reduced)}
      whileHover={reduced ? undefined : cardHover.hover}
      className={`h-full rounded-2xl ${className}`}
    >
      <motion.div
        animate={reduced ? undefined : floatLoop(floatDelay)}
        className="bg-brand-gradient-diagonal shadow-card relative flex h-full min-h-50 flex-col overflow-hidden rounded-2xl p-6 text-white"
      >
        {/* Faint node field, drawn in CSS so it costs no request. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-0 h-32 w-32 opacity-20 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:12px_12px]"
        />

        <div className="relative flex items-start justify-between gap-3">
          {Icon ? (
            <span aria-hidden="true" className="text-white">
              <Icon size={34} strokeWidth={1.5} />
            </span>
          ) : null}

          {/* Watermark, not a label — it sits well back from the icon. */}
          <span
            aria-hidden="true"
            className="font-display text-4xl leading-none font-bold text-white/30"
          >
            {step}
          </span>
        </div>

        <h3 className="relative mt-6 font-display text-xl font-bold text-white">{title}</h3>

        <p className="relative mt-3 text-sm leading-relaxed text-white/85">{description}</p>
      </motion.div>
    </motion.li>
  )
}
