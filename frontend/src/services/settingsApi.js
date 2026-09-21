import apiClient from './apiClient.js'
import { isMockEnabled, mockGetSettings } from '../mocks/mockGateway.js'

/**
 * GET /api/settings returns site-wide key/value settings. This page reads
 * `google_rating` and `google_review_count` for the testimonials header.
 *
 * Shape is now pinned by the backend, not guessed: SiteSettingController#getAll
 * declares `ApiResponse<Map<String, String>>` and SiteSettingService#getAll
 * builds a LinkedHashMap of settingKey -> settingValue. So the payload is a
 * FLAT `{key: value}` object, key-ordered. The `[{key, value}]` list branch that
 * used to live here was never producible by the server and has been removed;
 * the SETTINGS fixture is a flat object too, so both paths agree.
 *
 * (The entity columns are `setting_key`/`setting_value` because KEY is reserved
 * in MySQL, but those names never reach the wire — the map keys do.)
 *
 * Confirmed against a live response, which matched the source read exactly:
 *   {"success":true,"message":"Settings retrieved successfully",
 *    "data":{"address":"", ..., "google_rating":"4.6",
 *            "google_review_count":"250", "promo_banner_active":"true", ...}}
 *
 * Note every value is a STRING — "4.6", "250", "true" — and unset settings are
 * seeded as "" rather than null (see V10__create_site_setting.sql), because an
 * empty value renders as nothing while the literal "TODO" would ship to
 * production. So consumers must treat "" as absent and must not assume numbers.
 * The only reader today, TestimonialCarousel's RatingSummary, interpolates both
 * values as text behind a falsy guard, so strings and ""s are already correct
 * there; anything that starts doing arithmetic on them must convert first.
 */
export function normalizeSettings(raw) {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
}

export async function getAll({ signal } = {}) {
  if (isMockEnabled()) {
    return normalizeSettings(await mockGetSettings())
  }

  const { data } = await apiClient.get('/api/settings', { signal })
  // Backend wraps in ApiResponse<T>; real settings are in data.data
  return normalizeSettings(data?.data ?? data)
}

export default { getAll, normalizeSettings }
