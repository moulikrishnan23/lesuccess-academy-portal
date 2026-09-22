import apiClient from './apiClient.js'

function normalizeProgram(raw) {
  return {
    id: raw.id,
    type: raw.type ?? null,
    label: raw.label ?? null,
    title: raw.title ?? '',
    topic: raw.topic ?? '',
    speakerName: raw.speakerName ?? raw.trainerName ?? null,
    imageUrl: raw.imageUrl ?? raw.image ?? null,
    image: raw.imageUrl ?? raw.image ?? null,
    eventDate: raw.eventDate ?? null,      // "2026-09-06"
    startTime: raw.startTime ?? null,      // "17:00:00"
    endTime: raw.endTime ?? null,          // "18:30:00"
    platform: raw.platform ?? '',
    mode: raw.mode ?? 'ONLINE',
    meetLink: raw.meetLink ?? null,
    venueAddress: raw.venueAddress ?? null,
    organizationName: raw.organizationName ?? null,
    venueName: raw.venueName ?? null,
    certificateIncluded: raw.certificateIncluded ?? false,
    isActive: raw.active ?? raw.isActive ?? true,
    registrationCount: raw.registrationCount ?? 0,
  }
}

/**
 * GET /api/upcoming-programs?type={type}
 * Returns all active upcoming programs, optionally filtered by type (WEBINAR | WORKSHOP | INTERNSHIP).
 */
export async function listUpcoming(type = null, { signal } = {}) {
  const params = type ? { type } : {}
  const { data } = await apiClient.get('/api/upcoming-programs', { params, signal })
  const list = Array.isArray(data?.data) ? data.data : []
  return list.map(normalizeProgram)
}

/**
 * Admin: Upload image for an upcoming program / event speaker or banner.
 */
export async function uploadProgramImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post('/api/admin/upcoming-programs/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data?.data // { url, filename }
}

export default { listUpcoming, uploadProgramImage }
