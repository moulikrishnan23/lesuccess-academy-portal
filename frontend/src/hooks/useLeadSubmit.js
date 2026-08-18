import { useCallback, useEffect, useRef, useState } from 'react'
import leadApi from '../services/leadApi.js'

/**
 * Submits an enquiry to POST /api/leads.
 *
 * Deliberately does not navigate, reload, or toast — the caller decides what
 * success looks like. The enroll form swaps itself for a confirmation panel.
 *
 * @returns {{submit: Function, isSubmitting: boolean, isSuccess: boolean,
 *   error: Object|null, fieldErrors: Object, reset: Function}}
 */
export default function useLeadSubmit() {
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
   * @returns {Promise<boolean>} true when the lead was accepted, so the caller
   *   can await it without reading state that hasn't re-rendered yet.
   */
  const submit = useCallback(async (payload) => {
    if (inFlightRef.current) return false

    inFlightRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      await leadApi.submit(payload)
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
