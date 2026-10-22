import { useRef } from 'react'
import useInView from './useInView.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { toDigits, digitOffset } from './odometerDigits.js'

const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * A figure that rolls into place digit by digit when it scrolls into view.
 *
 * Each digit is a 0-9 strip in a 1em window, translated up by the digit's value
 * (1.6s on the shared easing, 90ms apart). The window is a fixed 1em box, so the
 * roll never changes layout. Screen readers get the whole value once via
 * aria-label; the strips are hidden from them.
 *
 * Reduced motion: the strips start at their final offsets with no transition.
 */
export default function Odometer({
  value,
  prefix = '',
  suffix = '',
  className = '',
  stagger = 90,
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { threshold: 0.4 })
  const settled = reduced || inView

  return (
    <span
      ref={ref}
      role="img"
      aria-label={`${prefix}${value}${suffix}`}
      className={`motion-odometer${reduced ? ' motion-odometer--static' : ''}${className ? ` ${className}` : ''}`}
    >
      {prefix && <span aria-hidden="true">{prefix}</span>}
      {toDigits(value).map((part, i) =>
        part.kind === 'digit' ? (
          <span key={i} className="motion-odometer-digit" aria-hidden="true">
            <span
              className="motion-odometer-strip"
              style={{
                transform: digitOffset(settled ? part.digit : 0),
                transitionDelay: `${part.order * stagger}ms`,
              }}
            >
              {STRIP.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">
            {part.char}
          </span>
        ),
      )}
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
  )
}
