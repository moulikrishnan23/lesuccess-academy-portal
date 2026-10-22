import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import useSpotlight from './useSpotlight.js'

/** matchMedia answering per query: reduced motion and "fine pointer that hovers". */
function stubMedia({ reduce = false, finePointer = true }) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: query.includes('prefers-reduced-motion') ? reduce : query.includes('pointer: fine') ? finePointer : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

function Grid() {
  const ref = useRef(null)
  useSpotlight(ref)
  return (
    <section ref={ref}>
      <article className="motion-spot" data-testid="card">
        <p data-testid="inner">text</p>
      </article>
    </section>
  )
}

function moveOver(el, x, y) {
  el.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))
}

describe('useSpotlight', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  const setup = (media) => {
    stubMedia(media)
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb(0)
      return 1
    })
    const view = render(<Grid />)
    const card = view.getByTestId('card')
    card.getBoundingClientRect = () => ({ left: 100, top: 50 })
    return { card, inner: view.getByTestId('inner') }
  }

  it('moves the glow to the pointer, relative to the card under it', () => {
    const { card, inner } = setup({})
    moveOver(inner, 160, 90)
    expect(card.style.getPropertyValue('--sx')).toBe('60px')
    expect(card.style.getPropertyValue('--sy')).toBe('40px')
  })

  it('leaves the glow centred under reduced motion', () => {
    const { card, inner } = setup({ reduce: true })
    moveOver(inner, 160, 90)
    expect(card.style.getPropertyValue('--sx')).toBe('')
  })

  it('does nothing on touch-only devices', () => {
    const { card, inner } = setup({ finePointer: false })
    moveOver(inner, 160, 90)
    expect(card.style.getPropertyValue('--sx')).toBe('')
  })
})
