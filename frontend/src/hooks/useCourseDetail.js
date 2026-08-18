import { useCallback, useEffect, useRef, useState } from 'react'
import courseApi from '../services/courseApi.js'

const EMPTY = { course: null, modules: [], techStack: [] }

/**
 * Loads a course and its nested collections for /courses/:slug.
 *
 * `notFound` is separate from `error` on purpose: an unknown slug is a normal
 * outcome that deserves its own copy, not the generic "try again" state.
 *
 * @param {string} slug
 * @returns {{course: Object|null, modules: Object[], techStack: Object[],
 *   isLoading: boolean, error: Object|null, notFound: boolean, refetch: Function}}
 */
export default function useCourseDetail(slug) {
  const [data, setData] = useState(EMPTY)
  const [isLoading, setIsLoading] = useState(Boolean(slug))
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  // Bumping this re-runs the effect; cleaner than duplicating the fetch body
  // into a separate refetch function that could drift from it.
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  // Guards against a slow response from a previous slug overwriting a newer one.
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!slug) {
      setData(EMPTY)
      setIsLoading(false)
      setNotFound(true)
      return undefined
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    let ignore = false

    setIsLoading(true)
    setError(null)
    setNotFound(false)

    courseApi
      .getBySlug(slug, { signal: controller.signal })
      .then((result) => {
        if (ignore || requestId !== requestIdRef.current) return
        setData(result)
        setIsLoading(false)
      })
      .catch((err) => {
        // StrictMode aborts the first request in development; that is not an error.
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current) return
        setData(EMPTY)
        if (err?.isNotFound) setNotFound(true)
        else setError(err)
        setIsLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [slug, attempt])

  return {
    course: data.course,
    modules: data.modules,
    techStack: data.techStack,
    isLoading,
    error,
    notFound,
    refetch,
  }
}
