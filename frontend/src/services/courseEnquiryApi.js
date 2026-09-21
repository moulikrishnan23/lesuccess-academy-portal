import apiClient from './apiClient.js'
import { normalizeMobile } from '../utils/validation.js'

/**
 * Build the request body for POST /api/course-enquiries.
 *
 * Optional fields are omitted rather than sent as "", matching contactApi and
 * leadApi: the backend caps each with @Size and treats absent as absent, so
 * there is no reason to store a row full of empty strings.
 *
 * `courseId` is sent only when it is a real number. The backend validates it
 * against a published course and rejects anything else with a 400 on that field,
 * so passing through a "" or a NaN would turn an optional dropdown into a
 * submission blocker.
 */
function toRequestBody({
  name,
  mobile,
  email,
  location,
  courseId,
  currentStatus,
  website,
}) {
  const body = {
    name: name.trim(),
    // Sent as 10 digits. The backend strips whitespace itself and accepts either
    // +91XXXXXXXXXX or a bare 10-digit number, so normalising here just means a
    // pasted "+91 98765 43210" cannot fail a regex it should have passed.
    mobile: normalizeMobile(mobile),
  }

  if (email?.trim()) body.email = email.trim()
  if (location?.trim()) body.location = location.trim()
  if (currentStatus?.trim()) body.currentStatus = currentStatus.trim()

  const numericCourseId = Number(courseId)
  if (courseId !== '' && courseId != null && Number.isFinite(numericCourseId)) {
    body.courseId = numericCourseId
  }

  /*
   * Honeypot. The backend treats a non-empty `website` as a bot and returns the
   * same 201 and body shape as a real submission, so it must be sent even when
   * empty — omitting it is fine (null is not a hit), but sending it keeps the
   * decoy's presence obvious to anyone reading this payload.
   */
  body.website = website ?? ''

  return body
}

/**
 * POST /api/course-enquiries → 201
 *
 * Deliberately does NOT route through mocks/mockGateway.js, for the same reason
 * contactApi does not: there is no mock for this endpoint, and adding one would
 * mean the navbar enquiry form silently stops posting whenever VITE_USE_MOCKS is
 * 'true' — which it is in .env.development. This endpoint is live, so it posts
 * live.
 *
 * A 400 rejects with an ApiError carrying `fieldErrors`, keyed by the backend's
 * field names (`name`, `mobile`, `email`, `courseId`), which the modal maps
 * straight onto its inputs.
 *
 * @throws {import('../utils/apiError.js').ApiError}
 */
export async function submit(payload, { signal } = {}) {
  const { data } = await apiClient.post(
    '/api/course-enquiries',
    toRequestBody(payload),
    { signal },
  )
  return data
}

export default { submit }
