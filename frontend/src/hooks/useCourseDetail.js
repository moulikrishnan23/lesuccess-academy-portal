import { useCallback, useEffect, useRef, useState } from 'react'
import courseApi from '../services/courseApi.js'

const EMPTY = { course: null, modules: [], techStack: [] }
const INITIAL = { key: null, data: EMPTY, error: null, notFound: false }

/**
 * Loads a course and its nested collections for /courses/:slug.
 *
 * `notFound` is separate from `error` on purpose: an unknown slug is a normal
 * outcome that deserves its own copy, not the generic "try again" state.
 *
 * The effect only ever writes state from a resolved promise. Loading, and the
 * reset that used to happen when the slug changed, are derived from whether
 * the stored result belongs to the request currently being asked for. That is
 * the same behaviour in one render instead of two, and it keeps the effect
 * free of synchronous setState (react-hooks/set-state-in-effect).
 *
 * @param {string} slug
 * @returns {{course: Object|null, modules: Object[], techStack: Object[],
 *   isLoading: boolean, error: Object|null, notFound: boolean, refetch: Function}}
 */
export default function useCourseDetail(slug) {
  // Bumping this re-runs the effect; cleaner than duplicating the fetch body
  // into a separate refetch function that could drift from it.
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  /*
   * Identifies the request the caller is currently asking for. null means there
   * is nothing to fetch — no slug in the URL, which is its own "not found".
   * A result is only shown when it was stored under this key, so changing slug
   * invalidates the previous course without having to clear it first.
   */
  const requestKey = slug ? `${slug}#${attempt}` : null

  const [result, setResult] = useState(INITIAL)

  // Guards against a slow response from a previous slug overwriting a newer one.
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (requestKey === null) return undefined

    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    let ignore = false

    courseApi
      .getBySlug(slug, { signal: controller.signal })
      .then((data) => {
        if (ignore || requestId !== requestIdRef.current) return
        setResult({ key: requestKey, data, error: null, notFound: false })
      })
      .catch((err) => {
        // StrictMode aborts the first request in development; that is not an error.
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current) return
        setResult({
          key: requestKey,
          data: EMPTY,
          error: err?.isNotFound ? null : err,
          notFound: Boolean(err?.isNotFound),
        })
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [requestKey, slug])

  // A stored result counts only for the request it was fetched for. Anything
  // else means the answer for the current request has not arrived yet.
  const isSettled = result.key === requestKey
  const data = isSettled ? result.data : EMPTY

  return {
    course: data.course,
    modules: data.modules,
    techStack: data.techStack,
    isLoading: requestKey !== null && !isSettled,
    error: isSettled ? result.error : null,
    // No slug is a not-found in its own right, as it was before.
    notFound: requestKey === null || (isSettled && result.notFound),
    refetch,
  }
}
