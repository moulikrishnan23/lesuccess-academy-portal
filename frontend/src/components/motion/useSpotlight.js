import { useEffect } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * A soft brand-red glow that follows the pointer across any `.motion-spot`
 * element inside `ref` (styles in motion.css).
 *
 * One delegated, rAF-throttled pointermove listener on the container writes the
 * pointer position to `--sx` / `--sy` on the card under it; nothing re-renders.
 * The glow fades in on hover through CSS, so this hook only moves it.
 *
 * Only on devices that have a fine pointer that can hover (any-, not the
 * primary pointer, so touchscreen laptops with a mouse qualify). Under reduced
 * motion the glow is not moved at all: it fades in, centred, and stays still.
 *
 * App mounts this once on the document, so every `.motion-spot` card on every
 * page follows the pointer; sections need not call it themselves.
 */
export default function useSpotlight(ref) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced) return undefined
    if (!window.matchMedia?.('(any-hover: hover) and (any-pointer: fine)').matches) return undefined

    let frame = 0
    let last = null

    const apply = () => {
      frame = 0
      const card = last?.target?.closest?.('.motion-spot')
      if (!card || !root.contains(card)) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--sx', `${last.clientX - rect.left}px`)
      card.style.setProperty('--sy', `${last.clientY - rect.top}px`)
    }
    const onMove = (event) => {
      last = event
      if (!frame) frame = requestAnimationFrame(apply)
    }

    root.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      root.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [ref, reduced])
}
