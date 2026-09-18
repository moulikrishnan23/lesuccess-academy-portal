import apiClient from './apiClient.js'
import { normalizeMobile } from '../utils/validation.js'

/**
 * Build the request body for POST /api/connect-with-us.
 *
 * Optional fields are omitted rather than sent as "", matching contactApi,
 * leadApi and courseEnquiryApi: the backend caps each with @Size and treats
 * absent as absent, so there is no reason to store a row full of empty strings.
 */
function toRequestBody({ name, mobile, email, website }) {
  const body = {
    name: name.trim(),
    // Sent as 10 digits. The backend strips whitespace itself and accepts either
    // +91XXXXXXXXXX or a bare 10-digit number, so normalising here just means a
    // pasted "+91 98765 43210" cannot fail a regex it should have passed.
    mobile: normalizeMobile(mobile),
  }

  if (email?.trim()) body.email = email.trim()

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
 * POST /api/connect-with-us → 201
 *
 * Its own endpoint and its own table, not POST /api/leads. This form used to
 * post as a HOME_CONNECT_FORM lead, which landed it in the shared lead_capture
 * table and the "Leads" sheet tab; it now has the `connect_with_us` table and a
 * "Connect With Us" tab of its own, because it is worked as its own queue.
 *
 * Deliberately does NOT route through mocks/mockGateway.js, for the same reason
 * contactApi and courseEnquiryApi do not: there is no mock for this endpoint,
 * and adding one would mean the Home form silently stops posting whenever
 * VITE_USE_MOCKS is 'true' — which it is in .env.development.
 *
 * A 400 rejects with an ApiError carrying `fieldErrors`, keyed by the backend's
 * field names (`name`, `mobile`, `email`).
 *
 * @throws {import('../utils/apiError.js').ApiError}
 */
export async function submit(payload, { signal } = {}) {
  const { data } = await apiClient.post(
    '/api/connect-with-us',
    toRequestBody(payload),
    { signal },
  )
  return data
}

export default { submit }
