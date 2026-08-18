/**
 * Shared Framer Motion variants.
 *
 * House rules, applied everywhere:
 *  - animate `transform` and `opacity` only, so the compositor does the work.
 *    The accordion panel's height is the one unavoidable exception.
 *  - 150–300ms for interactions, 400–600ms for scroll entrances.
 *  - every animated component passes its variants through `motionSafe()` so
 *    `prefers-reduced-motion: reduce` becomes an instant state change.
 */

// Gentle deceleration curve; shared so entrances feel like one system.
export const EASE_OUT = [0.22, 1, 0.36, 1]

export const DURATION = {
  tap: 0.12,
  interaction: 0.2,
  entrance: 0.5,
}

/** No transform, no delay, no duration — the reduced-motion substitute. */
export const instant = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { duration: 0 } },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.entrance, ease: EASE_OUT },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

/** Elevation on hover/focus for card surfaces. */
export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 2px rgba(15, 27, 26, 0.05)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px -12px rgba(15, 27, 26, 0.22)',
    transition: { duration: DURATION.interaction, ease: EASE_OUT },
  },
}

/** Mobile sticky enroll bar rising into place the first time it is shown. */
export const slideUpBar = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.32, ease: EASE_OUT },
  },
}

/** Validation messages: a short shake reads as "rejected", not "appeared". */
export const errorShake = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    x: [0, -4, 4, -2, 0],
    transition: { duration: 0.28, ease: EASE_OUT },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

/** Accordion body. Height is animated here by necessity, not by preference. */
export const accordionPanel = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.26, ease: EASE_OUT },
      opacity: { duration: 0.2, ease: EASE_OUT, delay: 0.04 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.22, ease: EASE_OUT },
      opacity: { duration: 0.12, ease: EASE_OUT },
    },
  },
}

/** Cross-fade used when a form is replaced by its success state. */
export const crossFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE_OUT } },
}

/** Carousel track easing, shared so every carousel on the site matches. */
export const CAROUSEL_TRANSITION = {
  type: 'tween',
  duration: 0.42,
  ease: EASE_OUT,
}

/**
 * Swap any variant set for an instant one when the visitor prefers reduced
 * motion. Call it at the point of use: `variants={motionSafe(fadeUp, reduced)}`.
 */
export function motionSafe(variants, reduced) {
  return reduced ? instant : variants
}

/** Viewport config for scroll entrances — play once, slightly before centre. */
export const ONCE_IN_VIEW = { once: true, amount: 0.15, margin: '0px 0px -80px 0px' }
