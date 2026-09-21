import apiClient from './apiClient.js'

/**
 * GET /api/services returns published service offerings, optionally filtered by
 * `?category=INSTITUTION|CORPORATE`. The endpoint already excludes DRAFT rows.
 *
 * The `service` table is created by V8__create_service.sql and nothing seeds
 * it, so today this returns an empty list. That is exactly why the caller must
 * treat [] as "use the static copy" rather than "render nothing".
 *
 * Deliberately NOT routed through mockGateway: there is no fixture for this
 * endpoint.
 */
export const SERVICE_CATEGORY = {
  INSTITUTION: 'INSTITUTION',
  CORPORATE: 'CORPORATE',
}

function normalizeServiceOffering(raw) {
  return {
    id: raw?.id ?? null,
    category: raw?.category ?? null,
    title: raw?.title ?? '',
    description: raw?.description ?? '',
    iconUrl: raw?.iconUrl ?? raw?.icon_url ?? null,
    status: raw?.status ?? null,
    displayOrder: raw?.displayOrder ?? raw?.display_order ?? 0,
  }
}

/**
 * Anything that is not an array collapses to [], which is the signal the
 * consuming hook uses to fall back to the page's static copy.
 */
export function normalizeServiceOfferings(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeServiceOffering)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
}

/**
 * One request for every category. The page needs both lists, and splitting a
 * single response client-side beats paying for two round trips.
 *
 * @param {string} [category] Optional INSTITUTION | CORPORATE filter.
 */
export async function getAll({ signal, category } = {}) {
  const { data } = await apiClient.get('/api/services', {
    signal,
    params: category ? { category } : undefined,
  })
  // Backend wraps in ApiResponse<T>; the real list is in data.data
  return normalizeServiceOfferings(data?.data ?? data)
}

export default { getAll, normalizeServiceOfferings, SERVICE_CATEGORY }
