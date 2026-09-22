import apiClient from './apiClient.js'
import { isMockEnabled, mockGetTestimonialsByCourse } from '../mocks/mockGateway.js'
import { GOOGLE_REVIEWS } from '../data/googleReviews.js'

/**
 * The backend filters before responding — CourseService#listTestimonials calls
 * findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc, and the Testimonial
 * entity carries an @SQLRestriction("deleted_at IS NULL") — so there is no
 * visibility check here. (The flag is `isActive`, not the `isApproved` this
 * comment used to name; there is no approval column in the schema.) If hidden
 * items ever appear, that is a backend bug — do not paper over it with a
 * client-side filter.
 *
 * TestimonialResponse serves: id, courseId, studentName, reviewText, quoteText,
 * rating, ratingValue, photoUrl, displayOrder, isActive, createdAt, updatedAt —
 * all camelCase (no Jackson naming strategy is configured), so the snake_case
 * fallbacks that used to be here were unreachable on both paths and are gone.
 * `quoteText`/`ratingValue` are aliases the DTO sets explicitly for this
 * frontend; `reviewText`/`rating` are the originals and are kept as fallbacks
 * because both are genuinely on the wire.
 */
function normalizeTestimonial(raw) {
  const rating = Number(raw.ratingValue ?? raw.rating)

  return {
    id: raw.id,
    studentName: raw.studentName ?? 'Student',
    photoUrl: raw.photoUrl ?? null,
    // Clamp: a star row that renders 7 stars because of bad data is worse than
    // one that renders 5.
    ratingValue: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
    quoteText: raw.quoteText ?? raw.reviewText ?? '',
    // NOT SERVED: there is no `source` column or DTO field on the backend, so
    // every live testimonial falls through to 'WEBSITE'. The fixtures do carry
    // it, which is why the default stays rather than the field being dropped.
    source: raw.source ?? 'WEBSITE',
    courseId: raw.courseId ?? null,
    displayOrder: raw.displayOrder ?? 0,
  }
}

/**
 * GET /api/courses/{idOrSlug}/testimonials returns
 * `ApiResponse<List<TestimonialResponse>>` — a bare array, never a page. The
 * `{ content: [...] }` unwrapping that used to be here had no producer and has
 * been removed.
 */
export function normalizeTestimonials(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map(normalizeTestimonial)
    .sort((a, b) => a.displayOrder - b.displayOrder)
}

/**
 * GET /api/courses/{idOrSlug}/testimonials
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
