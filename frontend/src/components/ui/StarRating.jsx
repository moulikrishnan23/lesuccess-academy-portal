import { useId } from 'react'

const STAR_PATH =
  'M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.21l-4.94 2.6.94-5.5-4-3.9 5.53-.8z'

function Star({ fill, size, clipId }) {
  // Partial fill via a clip over a second, coloured star — no half-star asset,
  // and 4.6 actually looks like 4.6 rather than rounding to 5.
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <path d={STAR_PATH} fill="currentColor" className="text-line-strong" />
      {fill > 0 ? (
        <>
          <defs>
            {/* useId keeps these unique across every rating on the page. */}
            <clipPath id={clipId}>
              <rect x="0" y="0" width={20 * fill} height="20" />
            </clipPath>
          </defs>
          <path
            d={STAR_PATH}
            fill="currentColor"
            className="text-gold"
            clipPath={`url(#${clipId})`}
          />
        </>
      ) : null}
    </svg>
  )
}

/**
 * A 0–5 star row.
 *
 * The stars are decorative; the value is announced once as text, so a screen
 * reader hears "Rated 4.6 out of 5" instead of five separate graphics.
 */
export default function StarRating({ value = 0, size = 16, className = '', label }) {
  const baseId = useId()
  const safe = Math.min(5, Math.max(0, Number(value) || 0))

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <span className="sr-only">{label ?? `Rated ${safe} out of 5`}</span>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          clipId={`${baseId}-star-${index}`}
          fill={Math.min(1, Math.max(0, safe - index))}
        />
      ))}
    </span>
  )
}
