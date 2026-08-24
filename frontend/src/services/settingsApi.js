import apiClient from './apiClient.js'
import { isMockEnabled, mockGetSettings } from '../mocks/mockGateway.js'

/**
 * GET /api/settings returns site-wide key/value settings. This page reads
 * `google_rating` and `google_review_count` for the testimonials header.
 *
 * The contract doesn't pin the response shape, so both a flat map and a
 * `[{key, value}]` list are accepted.
 * TODO(backend): confirm which, then delete the other branch.
 */
export function normalizeSettings(raw) {
  if (Array.isArray(raw)) {
    return raw.reduce((acc, item) => {
      if (item?.key) acc[item.key] = item.value
      return acc
    }, {})
  }
  return raw && typeof raw === 'object' ? raw : {}
}

export async function getAll({ signal } = {}) {
  if (isMockEnabled()) {
    return normalizeSettings(await mockGetSettings())
  }

  const { data } = await apiClient.get('/api/settings', { signal })
  return normalizeSettings(data)
}

export default { getAll, normalizeSettings }
