import apiClient from './apiClient.js'
import { isMockEnabled, mockGetTestimonialsByCourse } from '../mocks/mockGateway.js'
import { GOOGLE_REVIEWS } from '../data/googleReviews.js'

/**
 * The backend filters to isApproved === true before responding, so there is no
 * approval check here. If unapproved items ever appear, that is a backend bug —
 * do not paper over it with a client-side filter.
 */
function normalizeTestimonial(raw) {
  const rating = Number(raw.ratingValue ?? raw.rating_value ?? raw.rating ?? 5)

  return {
    id: raw.id,
    studentName: raw.studentName ?? raw.student_name ?? raw.name ?? 'Student',
    photoUrl: raw.photoUrl ?? raw.photo_url ?? null,
    ratingValue: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 5,
    quoteText: raw.quoteText ?? raw.quote_text ?? raw.reviewText ?? raw.review_text ?? raw.text ?? '',
    source: raw.source ?? 'GOOGLE',
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
 * Common review data for both Home Page and Courses Page:
 * First tries common /api/testimonials endpoint.
 * Falls back to course-specific endpoint, then to authentic Google Reviews data.
 *
 * @param {string|number} [courseId]
 * @returns {Promise<Object[]>}
 */
export async function getByCourse(courseId, { signal } = {}) {
  try {
    const { data } = await apiClient.get('/api/testimonials', { signal })
    const items = normalizeTestimonials(data?.data ?? data)
    if (items.length > 0) return items
  } catch (err) {
    // try fallback below
  }

  if (courseId) {
    try {
      const { data } = await apiClient.get(`/api/courses/${encodeURIComponent(courseId)}/testimonials`, { signal })
      const items = normalizeTestimonials(data?.data ?? data)
      if (items.length > 0) return items
    } catch (err) {
      // try fallback below
    }
  }

  if (isMockEnabled()) {
    const mockList = await mockGetTestimonialsByCourse(courseId)
    if (Array.isArray(mockList) && mockList.length > 0) {
      return normalizeTestimonials(mockList)
    }
  }

  // Fallback to authentic common Google Reviews dataset
  return normalizeTestimonials(GOOGLE_REVIEWS)
}

export default { getByCourse, normalizeTestimonials }
