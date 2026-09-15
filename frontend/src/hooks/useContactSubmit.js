import { useCallback, useEffect, useRef, useState } from 'react'
import contactApi from '../services/contactApi.js'

/**
 * The backend validates the number under its canonical name, `phone`, but the
 * Contact form's input is called `mobile`. Without this remap a server-side
 * phone error would arrive keyed to a field the form does not render, and would
 * silently vanish instead of appearing under the input the visitor typed into.
 */
function toFormFieldErrors(fieldErrors) {
  if (!fieldErrors) return {}

  const { phone, ...rest } = fieldErrors
  return phone ? { ...rest, mobile: phone } : rest
}

/**
 * Submits the Contact page form to POST /api/contact-messages.
 *
 * Shaped like useLeadSubmit on purpose — same in-flight guard, same unmount
 * guard, same "caller decides what success looks like" contract — so the two
 * submit paths read as one. It takes no `live` option because contactApi has no
 * mock branch to bypass.
 *
 * @returns {{submit: Function, isSubmitting: boolean, isSuccess: boolean,
 *   error: Object|null, fieldErrors: Object, reset: Function}}
 */
export default function useContactSubmit() {
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
   * @returns {Promise<boolean>} true when the message was accepted, so the
   *   caller can await it without reading state that hasn't re-rendered yet.
   */
  const submit = useCallback(async (payload) => {
    if (inFlightRef.current) return false

    inFlightRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      await contactApi.submit(payload)
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
    fieldErrors: toFormFieldErrors(error?.fieldErrors),
    reset,
  }
}
