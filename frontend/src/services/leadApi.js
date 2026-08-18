import apiClient from './apiClient.js'
import { isMockEnabled, mockSubmitLead } from '../mocks/mockGateway.js'

/** Where a lead came from. The course page only ever sends the first one. */
export const LEAD_SOURCE = {
  COURSE_ENROLL_FORM: 'COURSE_ENROLL_FORM',
}

/**
 * Build the request body. Optional fields are omitted rather than sent as ""
 * so backend validation doesn't have to treat empty string as absent.
 */
function toRequestBody({ name, mobile, email, courseId, lookingFor, source }) {
  const body = {
    name: name.trim(),
    mobile: mobile.trim(),
    courseId,
    source: source ?? LEAD_SOURCE.COURSE_ENROLL_FORM,
  }

  if (email?.trim()) body.email = email.trim()
  if (lookingFor?.trim()) body.lookingFor = lookingFor.trim()

  return body
}

/**
 * POST /api/leads → 201
 * A 400 rejects with an ApiError carrying `fieldErrors`, which the form maps
 * straight onto its inputs.
 */
export async function submit(payload, { signal } = {}) {
  const body = toRequestBody(payload)

  if (isMockEnabled()) {
    return mockSubmitLead(body)
  }

  const { data } = await apiClient.post('/api/leads', body, { signal })
  return data
}

export default { submit, LEAD_SOURCE }
