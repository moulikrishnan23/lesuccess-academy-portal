import { useEffect, useState } from 'react'
import settingsApi from '../services/settingsApi.js'

/**
 * Site-wide key/value settings from GET /api/settings.
 *
 * NOTE: this hook did not exist in the repo, so it is new here. It is
 * intentionally generic rather than course-specific — if another page needs
 * settings, extend this rather than adding a second fetch.
 *
 * Settings are decorative on this page (the rating header), so a failure is
 * swallowed into `settings: {}` and the consumer hides that header. It never
 * blocks or errors the page.
 */
export default function useSiteSettings() {
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    settingsApi
      .getAll({ signal: controller.signal })
      .then((result) => {
        if (ignore) return
        setSettings(result)
        setIsLoading(false)
      })
      .catch((err) => {
        if (ignore || err?.isCanceled) return
        setSettings({})
        setIsLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  return { settings: settings ?? {}, isLoading }
}
