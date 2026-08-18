import { makeApiError } from '../utils/apiError.js'
import { COURSES, SETTINGS, TESTIMONIALS } from './fixtures.js'

/**
 * Dev-only stand-in for the API. Active only when VITE_USE_MOCKS === 'true',
 * which is set in .env.development and left unset everywhere else.
 *
 * Services call these instead of the network, but still pass the result through
 * the same normalizer — so the mock path exercises the real parsing code and
 * can't drift into being a second, friendlier contract.
 *
 * Delete this folder and the `isMockEnabled()` branches once the backend ships.
 */

export function isMockEnabled() {
  return import.meta.env.VITE_USE_MOCKS === 'true'
}

/**
 * Dev-only state forcing, so the loading, error and empty branches are
 * reachable without a proxy or devtools throttling:
 *   ?mockState=slow    5s delay
 *   ?mockState=error   500 from every endpoint
 *   ?mockState=empty   course resolves, but with no modules/stack/testimonials
 *                      and no role copy, so the role section's hidden branch
 *                      is reachable too
 */
function forcedState() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('mockState')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function settle(value) {
  const state = forcedState()

  await delay(state === 'slow' ? 5000 : 550)

  if (state === 'error') {
    throw makeApiError(500, 'Mock failure — remove ?mockState=error to recover.')
  }

  return value
}

export async function mockGetCourseBySlug(slug) {
  const course = COURSES.find((item) => item.slug === slug)

  if (!course) {
    // Mirrors the contract's 404 so useCourseDetail's notFound branch is real.
    await delay(300)
    throw makeApiError(404, 'Not found.')
  }

  if (forcedState() === 'empty') {
    return settle({
      ...course,
      modules: [],
      techStack: [],
      roleHeading: null,
      roleIntro: null,
      roleColumns: [],
      roleBullets: [],
    })
  }

  return settle(course)
}

export async function mockGetTestimonialsByCourse(courseId) {
  if (forcedState() === 'empty') return settle([])
  return settle(TESTIMONIALS.filter((item) => item.courseId === courseId))
}

export async function mockGetSettings() {
  return settle(SETTINGS)
}

export async function mockSubmitLead(payload) {
  await delay(900)

  if (forcedState() === 'error') {
    throw makeApiError(400, 'Please check the highlighted fields.', {
      mobile: 'This number is already registered for this course.',
    })
  }

  return { id: Math.round(Math.random() * 10000), ...payload }
}
