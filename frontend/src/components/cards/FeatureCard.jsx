import { motion } from 'framer-motion'
import { cardHover, fadeUp, motionSafe } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * A service card: icon art over a centred title and paragraph.
 *
 * Used by the service page's dark section, so the card is white and carries a
 * resting shadow — a border alone does not separate a card from a photograph
 * behind it.
 *
 * The icon sits directly on the card with no badge behind it, drawn in brand
 * red at illustration size rather than as a UI glyph. It is decorative: the
 * card's meaning is its title and copy, so it is hidden from assistive tech.
 *
 * @param {Function} icon A lucide-react icon component.
 */
export default function FeatureCard({ icon: Icon, title, description, className = '' }) {
  const reduced = useReducedMotion()

  return (
    <motion.li
      // Entrance comes from the parent list's stagger; hover is a direct prop
      // rather than a second variant set, because hidden/visible and rest/hover
      // on one element fight over the same `y`.
      variants={motionSafe(fadeUp, reduced)}
      whileHover={reduced ? undefined : cardHover.hover}
      className={`shadow-card flex flex-col items-center rounded-[1.25rem] bg-white p-7 text-center ${className}`}
    >
      {Icon ? (
        <span aria-hidden="true" className="mb-4 text-brand">
          <Icon size={52} strokeWidth={1.25} />
        </span>
      ) : null}

      <h3 className="font-display text-base leading-snug font-bold text-navy-800 sm:text-lg">
        {title}
      </h3>

      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-soft">{description}</p>
    </motion.li>
  )
}
