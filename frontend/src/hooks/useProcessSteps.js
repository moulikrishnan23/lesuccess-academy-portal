import { useEffect, useState } from 'react'
import processStepApi from '../services/processStepApi.js'

/**
 * The four process stages from GET /api/process-steps.
 *
 * Same shape as useSiteSettings: AbortController + an `ignore` guard, and a
 * failure degrades to a safe default rather than erroring the page. The safe
 * default here is an EMPTY list, which the service page reads as "keep the
 * static copy" — so a dead endpoint leaves the section exactly as it renders
 * today.
 */
export default function useProcessSteps() {
  const [steps, setSteps] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    processStepApi
      .getAll({ signal: controller.signal })
      .then((result) => {
        if (ignore) return
        setSteps(result)
        setIsLoading(false)
      })
      .catch((err) => {
        if (ignore || err?.isCanceled) return
        setSteps([])
        setIsLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  return { steps: steps ?? [], isLoading }
}
