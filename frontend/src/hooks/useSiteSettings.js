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
let cachedSettingsPromise = null;
let cachedSettingsData = null;

export default function useSiteSettings() {
  const [settings, setSettings] = useState(() => cachedSettingsData);
  const [isLoading, setIsLoading] = useState(() => !cachedSettingsData);

  useEffect(() => {
    if (cachedSettingsData) {
      setSettings(cachedSettingsData);
      setIsLoading(false);
      return;
    }

    let ignore = false;

    if (!cachedSettingsPromise) {
      cachedSettingsPromise = settingsApi
        .getAll()
        .then((result) => {
          cachedSettingsData = result;
          return result;
        })
        .catch((err) => {
          cachedSettingsData = {};
          return {};
        });
    }

    cachedSettingsPromise.then((result) => {
      if (!ignore) {
        setSettings(result);
        setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  return { settings: settings ?? {}, isLoading };
}
