import { useCallback, useEffect, useRef, useState } from 'react'
import courseApi from '../services/courseApi.js'

const EMPTY = []

/**
 * The published course catalog, for /courses and the home page's featured row.
 *
 * Shaped like useCourseDetail on purpose: the effect only writes state from a
 * resolved promise, and `isLoading` derives from whether the stored result
 * belongs to the request currently being asked for. Keeping the two hooks the
 * same shape means one reading of how data loading works on this site.
 *
 * @returns {{courses: Object[], isLoading: boolean, error: Object|null,
 *   refetch: Function}}
 */
export default function useCourses() {
  // Bumping this re-runs the effect; cleaner than duplicating the fetch body
  // into a separate refetch function that could drift from it.
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  const [result, setResult] = useState({ key: null, courses: EMPTY, error: null })

  // Guards against a slow response from an earlier attempt landing last.
  const requestIdRef = useRef(0)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    let ignore = false

    courseApi
      .getAll({ signal: controller.signal })
      .then((list) => {
        if (ignore || requestId !== requestIdRef.current) return
        setResult({ key: attempt, courses: list, error: null })
      })
      .catch((err) => {
        // StrictMode aborts the first request in development; that is not an error.
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current) return
        setResult({ key: attempt, courses: EMPTY, error: err })
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [attempt])

  const isSettled = result.key === attempt

  return {
    courses: isSettled ? result.courses : EMPTY,
    isLoading: !isSettled,
    error: isSettled ? result.error : null,
    refetch,
  }
}
