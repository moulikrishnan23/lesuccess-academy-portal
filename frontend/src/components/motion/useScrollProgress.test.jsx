import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import useScrollProgress, { scrollProgress } from './useScrollProgress.js'
import { stubIntersectingObserver } from '../../test/motionEnv.js'

describe('scrollProgress', () => {
  // A 2600px section in a 1000px viewport has 1600px of scroll range.
  const H = 2600
  const VH = 1000

  it('is 0 before the section reaches the top of the viewport', () => {
    expect(scrollProgress(300, H, VH)).toBe(0)
    expect(scrollProgress(0, H, VH)).toBe(0)
  })

  it('is linear through the scroll range', () => {
    expect(scrollProgress(-400, H, VH)).toBe(0.25)
    expect(scrollProgress(-800, H, VH)).toBe(0.5)
  })

  it('clamps to 1 once the section has been scrolled past', () => {
    expect(scrollProgress(-1600, H, VH)).toBe(1)
    expect(scrollProgress(-5000, H, VH)).toBe(1)
  })

  it('treats a section with no scroll range as either not started or done', () => {
    expect(scrollProgress(10, 800, VH)).toBe(0)
    expect(scrollProgress(-10, 800, VH)).toBe(1)
    expect(scrollProgress(0, VH, VH)).toBe(1)
  })
})

function Probe({ disabled, top }) {
  const ref = useRef(null)
  useScrollProgress(ref, { disabled })
  return (
    <section
      ref={(el) => {
        ref.current = el
        if (el) el.getBoundingClientRect = () => ({ top, height: 2600 })
      }}
    />
  )
}

describe('useScrollProgress', () => {
  beforeEach(() => {
    stubIntersectingObserver()
    vi.stubGlobal('innerHeight', 1000)
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('writes the measured progress to --p without re-rendering', () => {
    const { container } = render(<Probe top={-800} />)
    expect(container.querySelector('section').style.getPropertyValue('--p')).toBe('0.5000')
  })

  it('pins --p at the final state when disabled (reduced motion)', () => {
    const { container } = render(<Probe disabled top={300} />)
    expect(container.querySelector('section').style.getPropertyValue('--p')).toBe('1.0000')
  })
})
