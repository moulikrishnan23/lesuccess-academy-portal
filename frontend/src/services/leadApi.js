import apiClient from './apiClient.js'
import { isMockEnabled, mockSubmitLead } from '../mocks/mockGateway.js'

/**
 * Where a lead came from. Each form sends its own.
 *
 * Both values are members of the backend's LeadSource enum (which also declares
 * HOME_DEMO_FORM and HOME_CONNECT_FORM, unused here), so they deserialize.
 * Whether a given source is actually accepted over HTTP is a separate runtime
 * decision — see `lesuccess.leads.accepted-sources` — and cannot be settled
 * from this file.
 */
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
   * It mattered when VITE_USE_MOCKS was 'true' and only the Service page CTA
   * posted for real. That flag is now 'false', so this is a no-op on the normal
   * path — it is kept because it is the escape hatch that lets someone turn the
   * mocks back on for the catalog (and their ?mockState= switches) while this
   * one form still hits the API.
   */
  if (!live && isMockEnabled()) {
    return mockSubmitLead(body)
  }

  const { data } = await apiClient.post('/api/leads', body, { signal })
  /*
   * Backend wraps in ApiResponse<LeadResponse>, so the created lead is at
   * data.data — unwrapped here so the live and mock paths return the same
   * thing rather than an envelope on one and a lead on the other.
   *
   * A honeypot-suppressed 201 deliberately carries `data: null` while looking
   * identical otherwise (see LeadController), so null is a SUCCESS here, not a
   * failure. Callers must not treat a null return as an error.
   */
  return data?.data ?? null
}

export default { submit, LEAD_SOURCE }
