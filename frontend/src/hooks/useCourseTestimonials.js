import { useCallback, useEffect, useRef, useState } from 'react'
import testimonialApi from '../services/testimonialApi.js'

/**
 * Approved testimonials for one course.
 *
 * Kept separate from useCourseDetail so a slow or failing testimonials call
 * never delays the course content — the page renders while this resolves.
 *
 * @param {number|string|null|undefined} courseId Pass null until the course loads.
 */
export default function useCourseTestimonials(courseId) {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  const requestIdRef = useRef(0)

  useEffect(() => {
    // The course id only exists after the course resolves; stay idle until then.
    if (courseId === null || courseId === undefined) {
      setTestimonials([])
      setIsLoading(false)
      setError(null)
      return undefined
    }

    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    let ignore = false

    setIsLoading(true)
    setError(null)

    testimonialApi
      .getByCourse(courseId, { signal: controller.signal })
      .then((result) => {
        if (ignore || requestId !== requestIdRef.current) return
        setTestimonials(result)
        setIsLoading(false)
      })
      .catch((err) => {
        if (ignore || err?.isCanceled || requestId !== requestIdRef.current) return
        setTestimonials([])
        setError(err)
        setIsLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [courseId, attempt])

  return { testimonials, isLoading, error, refetch }
}
