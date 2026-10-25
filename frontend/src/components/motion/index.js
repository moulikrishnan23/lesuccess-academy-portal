/*
 * Motion primitives for the lower Home page (spec: docs/mockup/lower-home.html).
 *
 * All of them read reduced motion from hooks/useReducedMotion.js, the app's one
 * source of truth, and fall back to a static final state. Styles: motion.css.
 */
export { default as useInView } from './useInView.js'
export { default as Reveal } from './Reveal.jsx'
export { default as useScrollProgress, scrollProgress } from './useScrollProgress.js'
export { default as Odometer } from './Odometer.jsx'
export { toDigits, digitOffset } from './odometerDigits.js'
export { default as Marquee } from './Marquee.jsx'
export { default as ConicBorder } from './ConicBorder.jsx'
export { default as useSpotlight } from './useSpotlight.js'
export { default as burstConfetti } from './confetti.js'
export { default as useReducedMotion, prefersReducedMotion } from '../../hooks/useReducedMotion.js'
