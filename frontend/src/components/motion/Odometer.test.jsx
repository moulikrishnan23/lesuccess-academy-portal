import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import Odometer from './Odometer.jsx'
import { toDigits, digitOffset } from './odometerDigits.js'
import { stubIntersectingObserver, stubReducedMotion } from '../../test/motionEnv.js'

describe('toDigits', () => {
  it('maps each digit to a strip and numbers digits left to right', () => {
    expect(toDigits(150)).toEqual([
      { kind: 'digit', digit: 1, order: 0 },
      { kind: 'digit', digit: 5, order: 1 },
      { kind: 'digit', digit: 0, order: 2 },
    ])
  })

  it('keeps non-digits as fixed glyphs without consuming a stagger slot', () => {
    expect(toDigits('4.6')).toEqual([
      { kind: 'digit', digit: 4, order: 0 },
      { kind: 'char', char: '.' },
      { kind: 'digit', digit: 6, order: 1 },
    ])
  })

  it('offsets a strip by one glyph height per digit', () => {
    expect(digitOffset(0)).toBe('translateY(-0em)')
    expect(digitOffset(7)).toBe('translateY(-7em)')
  })
})

describe('<Odometer>', () => {
  beforeEach(() => {
    stubReducedMotion(false)
    stubIntersectingObserver()
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('exposes the whole value once to assistive tech', () => {
    render(<Odometer value={250} suffix="+" />)
    expect(screen.getByRole('img', { name: '250+' })).toBeTruthy()
  })

  it('rolls every strip to its digit, staggered 90ms per digit', () => {
    const { container } = render(<Odometer value="4.6" />)
    const strips = [...container.querySelectorAll('.motion-odometer-strip')]
    expect(strips.map((s) => s.style.transform)).toEqual(['translateY(-4em)', 'translateY(-6em)'])
    expect(strips.map((s) => s.style.transitionDelay)).toEqual(['0ms', '90ms'])
  })
})
