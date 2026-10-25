import { prefersReducedMotion } from '../../hooks/useReducedMotion.js'

// Fallbacks match the @theme tokens in index.css; the live values are read from
// :root when available so the burst follows the palette if it ever changes.
const TOKENS = [
  ['--color-brand', '#DF1E26'],
  ['--color-brand-deep', '#CA164B'],
  ['--color-navy-800', '#07405C'],
  ['--color-navy-600', '#256a9e'],
  ['--color-section', '#f6f9fc'],
]

function palette() {
  const root = getComputedStyle(document.documentElement)
  return TOKENS.map(([name, fallback]) => root.getPropertyValue(name).trim() || fallback)
}

/**
 * Fires a one-off confetti burst upward from the centre of `originEl`.
 *
 * Draws on a temporary full-viewport canvas that ignores pointer events and is
 * removed when the burst ends, so nothing is left in the DOM. Returns a function
 * that cancels the burst early.
 *
 * A no-op under prefers-reduced-motion, and when there is no element or canvas.
 */
export default function burstConfetti(originEl, { count = 110, duration = 2400 } = {}) {
  const noop = () => {}
  if (!originEl || prefersReducedMotion()) return noop

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext?.('2d')
  if (!ctx) return noop

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '500',
  })
  document.body.appendChild(canvas)
  ctx.scale(dpr, dpr)

  const colors = palette()
  const rect = originEl.getBoundingClientRect()
  const ox = rect.left + rect.width / 2
  const oy = rect.top + Math.min(rect.height / 2, 120)
  const pieces = Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
    const speed = 6 + Math.random() * 10
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 7,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[i % colors.length],
      round: Math.random() > 0.5,
    }
  })

  let frame = 0
  const start = performance.now()
  const stop = () => {
    cancelAnimationFrame(frame)
    canvas.remove()
  }

  const draw = (now) => {
    const k = (now - start) / duration
    ctx.clearRect(0, 0, w, h)
    if (k >= 1) {
      stop()
      return
    }
    ctx.globalAlpha = Math.max(0, 1 - k * k)
    for (const p of pieces) {
      p.vy += 0.34
      p.vx *= 0.992
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6)
      }
      ctx.restore()
    }
    frame = requestAnimationFrame(draw)
  }
  frame = requestAnimationFrame(draw)

  return stop
}
