import apiClient from './apiClient.js'
import { isMockEnabled, mockGetTestimonialsByCourse } from '../mocks/mockGateway.js'

/**
 * The backend filters to isApproved === true before responding, so there is no
 * approval check here. If unapproved items ever appear, that is a backend bug —
 * do not paper over it with a client-side filter.
 */
function normalizeTestimonial(raw) {
  const rating = Number(raw.ratingValue ?? raw.rating_value)

  return {
    id: raw.id,
    studentName: raw.studentName ?? raw.student_name ?? 'Student',
    photoUrl: raw.photoUrl ?? raw.photo_url ?? null,
    // Clamp: a star row that renders 7 stars because of bad data is worse than
    // one that renders 5.
    ratingValue: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
    quoteText: raw.quoteText ?? raw.quote_text ?? '',
    source: raw.source ?? 'WEBSITE',
    courseId: raw.courseId ?? raw.course_id ?? null,
    displayOrder: raw.displayOrder ?? raw.display_order ?? 0,
  }
}

export function normalizeTestimonials(raw) {
  const list = Array.isArray(raw) ? raw : (raw?.content ?? [])
  return list
    .map(normalizeTestimonial)
    .sort((a, b) => a.displayOrder - b.displayOrder)
}

/**
 * GET /api/testimonials?courseId={id}
 * @returns {Promise<Object[]>}
 */
export async function getByCourse(courseId, { signal } = {}) {
  if (isMockEnabled()) {
    return normalizeTestimonials(await mockGetTestimonialsByCourse(courseId))
  }

  const { data } = await apiClient.get('/api/testimonials', {
    params: { courseId },
    signal,
  })
  return normalizeTestimonials(data)
}

export default { getByCourse, normalizeTestimonials }
