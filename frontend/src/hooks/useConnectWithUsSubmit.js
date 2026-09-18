import { useCallback, useEffect, useRef, useState } from 'react'
import connectWithUsApi from '../services/connectWithUsApi.js'

/**
 * Submits the Home page "Connect with Us" form to POST /api/connect-with-us.
 *
 * Shaped like useLeadSubmit and useContactSubmit on purpose — same in-flight
 * guard, same unmount guard, same "caller decides what success looks like"
 * contract — so every submit path in the app reads as one.
 *
 * Its own hook rather than a generalised useLeadSubmit: that hook's only option
 * is `live`, which exists solely to bypass mockGateway for /api/leads. This
 * endpoint has no mock branch to bypass, so threading an endpoint through
 * useLeadSubmit would leave a flag that means nothing here. useContactSubmit
 * set that precedent for exactly this reason.
 *
 * @returns {{submit: Function, isSubmitting: boolean, isSuccess: boolean,
 *   error: Object|null, fieldErrors: Object, reset: Function}}
 */
export default function useConnectWithUsSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const isMountedRef = useRef(true)
  // Second line of defence against double-submit: the button is disabled while
  // submitting, but a fast double Enter can beat the re-render.
  const inFlightRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    setIsSubmitting(false)
    setIsSuccess(false)
    setError(null)
    inFlightRef.current = false
  }, [])

  /**
   * @returns {Promise<boolean>} true when the submission was accepted, so the
   *   caller can await it without reading state that hasn't re-rendered yet.
   */
  const submit = useCallback(async (payload) => {
    if (inFlightRef.current) return false

    inFlightRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      await connectWithUsApi.submit(payload)
      if (isMountedRef.current) {
        setIsSuccess(true)
        setIsSubmitting(false)
      }
      return true
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
        setIsSubmitting(false)
      }
      return false
    } finally {
      inFlightRef.current = false
    }
  }, [])

  return {
    submit,
    isSubmitting,
    isSuccess,
    error,
    fieldErrors: error?.fieldErrors ?? {},
    reset,
  }
}
