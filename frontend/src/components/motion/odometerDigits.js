/**
 * Splits a figure into what the Odometer draws: a rolling strip for each digit,
 * and a fixed glyph for everything else ("4.6" -> digit, ".", digit).
 *
 * `order` counts digits only, so the 90ms stagger runs left to right across the
 * digits and does not stall on a decimal point or a comma.
 *
 * Lives outside Odometer.jsx so that file exports only a component (fast refresh).
 */
export function toDigits(value) {
  let order = 0
  return Array.from(String(value)).map((char) =>
    /\d/.test(char)
      ? { kind: 'digit', digit: Number(char), order: order++ }
      : { kind: 'char', char },
  )
}

/** The strip's resting offset: digit d sits d glyph-heights up the 0-9 strip. */
export function digitOffset(digit) {
  return `translateY(-${digit}em)`
}
