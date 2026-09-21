import apiClient from './apiClient.js'

function normalizeProgram(raw) {
  return {
    id: raw.id,
    type: raw.type ?? null,
    label: raw.label ?? null,
    title: raw.title ?? '',
    topic: raw.topic ?? '',
    eventDate: raw.eventDate ?? null,      // "2026-09-06"
    startTime: raw.startTime ?? null,      // "17:00:00"
    endTime: raw.endTime ?? null,          // "18:30:00"
    platform: raw.platform ?? '',
    meetLink: raw.meetLink ?? null,
    certificateIncluded: raw.certificateIncluded ?? false,
    isActive: raw.active ?? raw.isActive ?? true,
    registrationCount: raw.registrationCount ?? 0,
  }
}

/**
 * GET /api/upcoming-programs?type={type}
 * Returns all active upcoming programs, optionally filtered by type (WEBINAR | INTERNSHIP).
 */
export async function listUpcoming(type = null, { signal } = {}) {
  const params = type ? { type } : {}
  const { data } = await apiClient.get('/api/upcoming-programs', { params, signal })
  const list = Array.isArray(data?.data) ? data.data : []
  return list.map(normalizeProgram)
}

export default { listUpcoming }
