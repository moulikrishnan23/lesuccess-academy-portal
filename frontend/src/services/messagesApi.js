import apiClient from './apiClient.js'

/**
 * The admin inbox: the five public forms that write to the database.
 *
 * Every one of these endpoints returns ApiResponse<PageResponse<T>> and accepts
 * page/size/sortBy/sortDir, so the fetching is identical across all five and
 * lives here once. What differs between them — columns, filters, status
 * options, and the verb their status endpoint wants — is data, and it lives in
 * pages/Admin/components/messages/messageSources.js.
 *
 * Deliberately NOT routed through mocks/mockGateway.js: these are admin-only
 * reads with no fixtures, and the gateway has no entry for them.
 */

function unwrap(data) {
  // Backend wraps every payload in ApiResponse<T>; the real body is data.data.
  return data?.data ?? data
}

/**
 * PageResponse -> a shape the table can render without optional chaining at
 * every use site. A non-object (or an error already swallowed upstream) becomes
 * an empty page rather than throwing, so the table's empty state is the single
 * representation of "nothing to show".
 */
export function normalizePage(raw) {
  const page = raw && typeof raw === 'object' ? raw : {}

  return {
    items: Array.isArray(page.content) ? page.content : [],
    page: Number.isFinite(page.page) ? page.page : 0,
    size: Number.isFinite(page.size) ? page.size : 0,
    totalElements: Number.isFinite(page.totalElements) ? page.totalElements : 0,
    totalPages: Number.isFinite(page.totalPages) ? page.totalPages : 0,
  }
}

/**
 * One page of a message source.
 *
 * `params` carries the source's own filters (status, source, courseId, search)
 * alongside paging. Empty-string filter values are dropped rather than sent:
 * the backend binds `?status=` to a null enum and would 400 on it.
 */
export async function listMessages(path, { params = {}, signal } = {}) {
  const query = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  )

  const { data } = await apiClient.get(path, { params: query, signal })
  return normalizePage(unwrap(data))
}

/**
 * Change one record's status.
 *
 * The verb is not uniform across the API — contact messages and leads expose
 * PUT, demo bookings expose PATCH — so each source declares its own and this
 * function does not guess. The body is `{ status }` for all three.
 */
export async function updateMessageStatus(path, { id, status, method = 'put' }) {
  const verb = method.toLowerCase()
  if (verb !== 'put' && verb !== 'patch') {
    throw new Error(`Unsupported status verb: ${method}`)
  }

  const { data } = await apiClient[verb](`${path}/${id}/status`, { status })
  return unwrap(data)
}

export default { listMessages, updateMessageStatus, normalizePage }
