import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import Odometer from './Odometer.jsx'
import Marquee from './Marquee.jsx'
import Reveal from './Reveal.jsx'
import burstConfetti from './confetti.js'
import { prefersReducedMotion } from '../../hooks/useReducedMotion.js'
import { stubReducedMotion } from '../../test/motionEnv.js'

/*
 * Under prefers-reduced-motion every primitive must render its final state
 * immediately. No IntersectionObserver is stubbed with `observe` firing here
 * on purpose: nothing may wait for the element to scroll into view.
 */
class NeverIntersects {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('reduced motion fallbacks', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it('is read from the one shared query', () => {
    stubReducedMotion(true)
    expect(prefersReducedMotion()).toBe(true)
    stubReducedMotion(false)
    expect(prefersReducedMotion()).toBe(false)
  })

  it('assumes motion is fine where matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })

  describe('with reduce set', () => {
    const setup = () => {
      stubReducedMotion(true)
      vi.stubGlobal('IntersectionObserver', NeverIntersects)
    }

    it('Odometer starts at its final digits with no transition', () => {
      setup()
      const { container } = render(<Odometer value={150} />)
      const strips = [...container.querySelectorAll('.motion-odometer-strip')]
      expect(strips.map((s) => s.style.transform)).toEqual([
        'translateY(-1em)',
        'translateY(-5em)',
        'translateY(-0em)',
      ])
      expect(container.firstChild.classList.contains('motion-odometer--static')).toBe(true)
    })

    it('Marquee renders a single static copy', () => {
      setup()
      const { container } = render(<Marquee items={[<span key="a">A</span>, <span key="b">B</span>]} />)
      expect(container.querySelectorAll('.motion-marquee-group')).toHaveLength(1)
      expect(container.firstChild.classList.contains('motion-marquee--static')).toBe(true)
    })

    it('Reveal is shown without waiting to be scrolled to', () => {
      setup()
      const { container } = render(<Reveal>hello</Reveal>)
      expect(container.firstChild.classList.contains('is-in')).toBe(true)
    })

    it('confetti does not draw anything', () => {
      setup()
      const target = document.createElement('div')
      document.body.appendChild(target)
      const cancel = burstConfetti(target)
      expect(document.querySelector('canvas')).toBeNull()
      expect(typeof cancel).toBe('function')
    })
  })

  it('Marquee duplicates its items for the loop when motion is allowed, hiding the copy', () => {
    stubReducedMotion(false)
    const { container } = render(<Marquee items={[<span key="a">A</span>]} />)
    const groups = container.querySelectorAll('.motion-marquee-group')
    expect(groups).toHaveLength(2)
    expect(groups[1].getAttribute('aria-hidden')).toBe('true')
    expect(groups[1].hasAttribute('inert')).toBe(true)
  })
})
