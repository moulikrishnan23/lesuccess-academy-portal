import { vi } from 'vitest'

/*
 * jsdom implements neither matchMedia nor IntersectionObserver. These stubs give
 * the motion tests explicit control over both.
 */

/** window.matchMedia answering `reduce` for prefers-reduced-motion. */
export function stubReducedMotion(reduce) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: query.includes('prefers-reduced-motion') ? reduce : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

/**
 * An IntersectionObserver that reports every observed element as intersecting
 * as soon as it is observed, so in-view effects settle synchronously in a test.
 */
export function stubIntersectingObserver() {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback) {
        this.callback = callback
      }
      observe(target) {
        this.callback([{ isIntersecting: true, target }], this)
      }
      unobserve() {}
      disconnect() {}
    },
  )
}
