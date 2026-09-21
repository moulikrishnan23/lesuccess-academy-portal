import apiClient from './apiClient.js'

/**
 * GET /api/process-steps returns the four "How LeSuccess Drives Success"
 * stages. The table is seeded by V9__create_process_step.sql, so this endpoint
 * does return rows — but the page still keeps its static copy as a fallback,
 * because a failed or empty fetch must not blank the section.
 *
 * Deliberately NOT routed through mockGateway: there is no fixture for this
 * endpoint, so a mock branch would only invent data.
 */
function normalizeProcessStep(raw) {
  return {
    id: raw?.id ?? null,
    stepNumber: raw?.stepNumber ?? raw?.step_number ?? 0,
    title: raw?.title ?? '',
    description: raw?.description ?? '',
    iconUrl: raw?.iconUrl ?? raw?.icon_url ?? null,
  }
}

/**
 * Anything that is not an array collapses to [], which is the signal the
 * consuming hook uses to fall back to the page's static copy.
 */
export function normalizeProcessSteps(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeProcessStep)
    .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
}

export async function getAll({ signal } = {}) {
  const { data } = await apiClient.get('/api/process-steps', { signal })
  // Backend wraps in ApiResponse<T>; the real list is in data.data
  return normalizeProcessSteps(data?.data ?? data)
}

export default { getAll, normalizeProcessSteps }
