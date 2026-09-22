import { useEffect, useMemo, useState } from 'react'
import serviceOfferingApi, {
  SERVICE_CATEGORY,
} from '../services/serviceOfferingApi.js'

/**
 * Published service offerings from GET /api/services.
 *
 * ONE request, split client-side on `category`. The endpoint accepts
 * `?category=`, but the page needs both lists, and two round trips for one
 * table is a worse trade than a filter in the browser.
 *
 * Same shape as useSiteSettings: AbortController + an `ignore` guard, and a
 * failure degrades to a safe default rather than erroring the page. The safe
 * default is an EMPTY list, which the service page reads as "keep the static
 * copy". The `service` table is unseeded today, so empty is the expected
 * everyday result — not an error state.
 */
export default function useServiceOfferings() {
  const [offerings, setOfferings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    serviceOfferingApi
      .getAll({ signal: controller.signal })
      .then((result) => {
        if (ignore) return
        setOfferings(result)
        setIsLoading(false)
      })
      .catch((err) => {
        if (ignore || err?.isCanceled) return
        setOfferings([])
        setIsLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  // Memoized so the `null` (still-loading) case does not hand a fresh []
  // to the filters — and to the page's own memos — on every render.
  const list = useMemo(() => offerings ?? [], [offerings])

  const institution = useMemo(
    () => list.filter((item) => item.category === SERVICE_CATEGORY.INSTITUTION),
    [list],
  )
  const corporate = useMemo(
    () => list.filter((item) => item.category === SERVICE_CATEGORY.CORPORATE),
    [list],
  )

  return { institution, corporate, isLoading }
}
