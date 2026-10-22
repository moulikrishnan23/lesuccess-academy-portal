import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * An endless horizontal strip.
 *
 * The items are rendered twice and the track slides by exactly one copy plus
 * one gap (motion.css), so the loop has no seam. The second copy is aria-hidden
 * and inert: screen readers and keyboard users meet each item once. The strip
 * pauses on hover (optional) and always while anything inside has focus.
 *
 * Reduced motion: one copy, no animation, scrollable sideways instead.
 *
 * `items` is an array of React nodes, each carrying its own key.
 */
export default function Marquee({
  items,
  reverse = false,
  speed = 38,
  gap = '1.5rem',
  pauseOnHover = true,
  label,
  className = '',
}) {
  const reduced = useReducedMotion()
  if (!items?.length) return null

  const classes = [
    'motion-marquee',
    reverse && 'motion-marquee--reverse',
    pauseOnHover && 'motion-marquee--pause',
    reduced && 'motion-marquee--static',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{ '--marquee-duration': `${speed}s`, '--marquee-gap': gap }}
      role={label ? 'region' : undefined}
      aria-label={label}
    >
      <div className="motion-marquee-track">
        <div className="motion-marquee-group">{items}</div>
        {!reduced && (
          <div className="motion-marquee-group" aria-hidden="true" inert>
            {items}
          </div>
        )}
      </div>
    </div>
  )
}
