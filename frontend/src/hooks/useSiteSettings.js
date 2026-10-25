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
const SETTINGS_UPDATED_EVENT = 'lesuccess:site-settings-updated';

export function publishSiteSettings(settings) {
  cachedSettingsData = settings ?? {};
  cachedSettingsPromise = Promise.resolve(cachedSettingsData);
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: cachedSettingsData }));
  try { localStorage.setItem('lesuccess-site-settings-updated', String(Date.now())); } catch { /* storage may be unavailable */ }
}

export default function useSiteSettings() {
  const [settings, setSettings] = useState(() => cachedSettingsData);
  const [isLoading, setIsLoading] = useState(() => !cachedSettingsData);

  useEffect(() => {
    // No early return for an already-cached value: the lazy useState above has
    // it, and the resolved promise below re-delivers the same object from a
    // callback (a no-op render), so state is never set in the effect body.
    let ignore = false;
    const applyUpdate = (event) => {
      const next = event.detail ?? cachedSettingsData;
      if (next) setSettings(next);
    };
    const onStorage = (event) => {
      if (event.key !== 'lesuccess-site-settings-updated') return;
      cachedSettingsPromise = null;
      settingsApi.getAll().then((fresh) => {
        cachedSettingsData = fresh;
        if (!ignore) setSettings(fresh);
      }).catch(() => {});
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, applyUpdate);
    window.addEventListener('storage', onStorage);

    if (!cachedSettingsPromise) {
      cachedSettingsPromise = settingsApi
        .getAll()
        .then((result) => {
          cachedSettingsData = result;
          return result;
        })
        .catch(() => {
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
      window.removeEventListener(SETTINGS_UPDATED_EVENT, applyUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return { settings: settings ?? {}, isLoading };
}
