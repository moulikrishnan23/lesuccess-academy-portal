/**
 * Inline UI icons.
 *
 * These are interface furniture (hero stat pills, the Google mark on the rating
 * header, the quote glyph on testimonial cards), not content — every one is
 * aria-hidden and carries meaning only alongside its adjacent text.
 *
 * Technology logos are NOT here: those come from CourseTechStack.iconUrl, so
 * the admin dashboard controls them.
 */

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': 'true',
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/** Duration pill. */
export function ClockIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M12 7.5V12l3 1.8" {...stroke} />
    </svg>
  )
}

/** "Certificate Included" pill. */
export function CertificateIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9.5" r="5.5" {...stroke} />
      <path d="M8.6 14.3 7.5 21l4.5-2.3 4.5 2.3-1.1-6.7" {...stroke} />
    </svg>
  )
}

/** "Placement Assistance" pill. */
export function BriefcaseIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2" {...stroke} />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18" {...stroke} />
    </svg>
  )
}

/** "Affordable Fees" pill. */
export function TagIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.5V5a1 1 0 0 1 1-1h5.5a2 2 0 0 1 1.4.6l7.5 7.5a2 2 0 0 1 0 2.8l-5.5 5.5a2 2 0 0 1-2.8 0L4.6 12.9a2 2 0 0 1-.6-1.4Z" {...stroke} />
      <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** Google mark for the review-rating header. Brand colours are intentional. */
export function GoogleIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.3c-.1 1-.8 2.6-2.3 3.6l3.5 2.7c2.1-1.9 3.5-4.8 3.5-8.1z" />
      <path fill="#34A853" d="M12 23.5c3 0 5.6-1 7.5-2.7l-3.5-2.7c-1 .6-2.3 1.1-4 1.1-3 0-5.6-2-6.5-4.8l-3.7 2.8c1.9 3.7 5.7 6.3 10.2 6.3z" />
      <path fill="#FBBC05" d="M5.5 14.4c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2L1.8 7.2C1 8.7.6 10.3.6 12.2s.4 3.5 1.2 5z" />
      <path fill="#EA4335" d="M12 5.2c2.1 0 3.5.9 4.4 1.7l3.2-3.1C17.6 1.9 15 .9 12 .9 7.5.9 3.7 3.5 1.8 7.2l3.7 2.8C6.4 7.2 9 5.2 12 5.2z" />
    </svg>
  )
}

/** Opening quote glyph on testimonial cards. */
export function QuoteIcon({ size = 28, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13 8.5v5.2c-2.4 0-3.6 1.2-3.6 3.4h3.6V24H5v-6.4C5 11.9 7.7 8.8 13 8.5zm14 0v5.2c-2.4 0-3.6 1.2-3.6 3.4H27V24h-8v-6.4c0-5.7 2.7-8.8 8-9.1z" />
    </svg>
  )
}

/** Bullet marker for the certificate benefit list. */
export function PlusMarker({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/** Carousel and accordion chevron. */
export function ChevronIcon({ size = 16, direction = 'down', ...props }) {
  const paths = {
    down: 'M4 6.5 8 10.5l4-4',
    left: 'M10 3 5.5 8 10 13',
    right: 'M6 3l4.5 5L6 13',
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d={paths[direction]}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
