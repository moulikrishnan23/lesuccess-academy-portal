import apiClient from './apiClient.js'
import { isMockEnabled, mockSubmitLead } from '../mocks/mockGateway.js'

/** Where a lead came from. Each form sends its own. */
export const LEAD_SOURCE = {
  COURSE_ENROLL_FORM: 'COURSE_ENROLL_FORM',
  SERVICE_CTA_FORM: 'SERVICE_CTA_FORM',
}

/**
 * Build the request body. Optional fields are omitted rather than sent as ""
 * so backend validation doesn't have to treat empty string as absent.
 */
function toRequestBody({ name, mobile, email, courseId, lookingFor, source }) {
  const body = {
    name: name.trim(),
    source: source ?? LEAD_SOURCE.COURSE_ENROLL_FORM,
  }

  // Mobile is required by the enroll card and absent from the service enquiry
  // form, so it is sent only when there is one. courseId likewise: a service
  // enquiry is not about a course.
  if (mobile?.trim()) body.mobile = mobile.trim()
  if (courseId !== null && courseId !== undefined) body.courseId = courseId
  if (email?.trim()) body.email = email.trim()
  if (lookingFor?.trim()) body.lookingFor = lookingFor.trim()

  return body
}

/**
 * POST /api/leads → 201
 * A 400 rejects with an ApiError carrying `fieldErrors`, which the form maps
 * straight onto its inputs.
 */
export async function submit(payload, { signal, live = false } = {}) {
  const body = toRequestBody(payload)

  /*
   * `live` opts a single caller out of the mock gateway.
   *
   * The Service page CTA posts for real while VITE_USE_MOCKS stays 'true' for
   * the rest of the app. Flipping that flag globally would take the Home and
   * Course pages live at the same time, which is out of scope — and their
   * services do not yet unwrap the ApiResponse envelope, so they would render
   * empty rather than fail loudly.
   */
  if (!live && isMockEnabled()) {
    return mockSubmitLead(body)
  }

  const { data } = await apiClient.post('/api/leads', body, { signal })
  return data
}

export default { submit, LEAD_SOURCE }
