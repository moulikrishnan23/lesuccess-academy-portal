import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/**
 * The same answer as the hook, for code that runs outside React's render cycle
 * (rAF loops, canvas bursts, event handlers). Reads the one QUERY above so the
 * hook and its imperative callers can never disagree.
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? getSnapshot()
    : false
}

// SSR / prerender has no matchMedia; assume motion is fine and let the client
// correct it on hydration.
function getServerSnapshot() {
  return false
}

/**
 * True when the visitor has asked the OS to reduce motion.
 *
 * Every animated component in this app reads this and swaps its variants for an
 * instant state change (see src/animations/variants.js). Prefer this over
 * framer-motion's own hook so non-Framer transitions can share one source.
 */
export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
