/**
 * Turn `durationValue` + `durationUnit` into something readable.
 *
 * The unit arrives as an enum name ("MONTHS"), so it is title-cased and
 * de-pluralised for a value of 1. Returns null when the course has no duration,
 * which lets the caller drop the pill rather than render "null".
 */
export function formatDuration(value, unit) {
  if (value === null || value === undefined || value === '') return null

  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null

  if (!unit) return String(numeric)

  const word = String(unit).toLowerCase()
  const singular = numeric === 1 && word.endsWith('s') ? word.slice(0, -1) : word

  return `${numeric} ${singular.charAt(0).toUpperCase()}${singular.slice(1)}`
}

/** Indian-format currency, no decimals. Returns null for absent prices. */
export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return null

  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric)
}

/** "GOOGLE" -> "Google". Used for testimonial provenance. */
export function titleCase(value) {
  if (!value) return ''
  return String(value)
    .toLowerCase()
    .replace(/(^|\s|&)\w/g, (match) => match.toUpperCase())
}
