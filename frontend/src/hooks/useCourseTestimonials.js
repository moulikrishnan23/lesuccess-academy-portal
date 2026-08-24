import { useCallback, useEffect, useRef, useState } from 'react'
import testimonialApi from '../services/testimonialApi.js'

const EMPTY = []

/**
 * Approved testimonials for one course.
 *
 * Kept separate from useCourseDetail so a slow or failing testimonials call
 * never delays the course content — the page renders while this resolves.
 *
 * The effect only ever writes state from a resolved promise. `isLoading` and
 * the reset-on-change behaviour are derived from whether the stored result
 * belongs to the request currently being asked for, rather than being pushed
 * into state synchronously when `courseId` changes — that is the same
 * behaviour in one render instead of two, and it keeps the effect free of
 * synchronous setState (react-hooks/set-state-in-effect).
 *
 * @param {number|string|null|undefined} courseId Pass null until the course loads.
 * @returns {{testimonials: Object[], isLoading: boolean, error: Object|null,
 *   refetch: Function}}
 */
export default function useCourseTestimonials(courseId) {
  // Bumping this re-runs the effect; cleaner than duplicating the fetch body
  // into a separate refetch function that could drift from it.
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  /*
   * Identifies the request the caller is currently asking for. null means
   * "nothing to fetch yet" — the course id only exists after the course
   * resolves. A result is only shown when it was stored under this key, so a
   * course change invalidates the previous result without clearing it first.
   */
  const requestKey =
    courseId === null || courseId === undefined ? null : `${courseId}#${attempt}`

  const [result, setResult] = useState({ key: null, testimonials: EMPTY, error: null })

  // Guards against a slow response from a previous course overwriting a newer one.
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (requestKey === null) return undefined

    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    let ignore = false

    testimonialApi
      .getByCourse(courseId, { signal: controller.signal })
      .then((list) => {
        if (ignore || requestId !== requestIdRef.current) return
        setResult({ key: requestKey, testimonials: list, error: null })
      })
      .catch((err) => {
        // StrictMode aborts the first request in development; that is not an error.
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current) return
        setResult({ key: requestKey, testimonials: EMPTY, error: err })
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [requestKey, courseId])

  // A stored result counts only for the request it was fetched for. Anything
  // else means the answer for the current request has not arrived yet.
  const isSettled = result.key === requestKey

  return {
    testimonials: isSettled ? result.testimonials : EMPTY,
    isLoading: requestKey !== null && !isSettled,
    error: isSettled ? result.error : null,
    refetch,
  }
}
