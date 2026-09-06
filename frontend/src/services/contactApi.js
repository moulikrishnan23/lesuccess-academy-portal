import apiClient from './apiClient.js'
import { normalizeMobile } from '../utils/validation.js'

/**
 * Build the request body for POST /api/contact-messages.
 *
 * Two things here are contract, not preference:
 *
 * 1. The number is sent as `mobile`, not `phone`. ContactMessageRequest names
 *    the field `phone` and accepts `mobile` via @JsonAlias specifically for this
 *    page — its docblock cites Contact.jsx by path. Sending `phone` would work
 *    too, but it would make that comment false and orphan a tested code path.
 *
 * 2. Optional fields are omitted rather than sent as "". The backend caps them
 *    with @Size and treats absent as absent, so there is no reason to store a
 *    row full of empty strings.
 */
function toRequestBody({
  name,
  mobile,
  email,
  whoYouAre,
  lookingFor,
  location,
  message,
  website,
}) {
  const body = {
    name: name.trim(),
    email: email.trim(),
    // Sent as 10 digits. The backend strips whitespace itself and accepts either
    // +91XXXXXXXXXX or a bare 10-digit number, so normalising here just means a
    // pasted "+91 98765 43210" cannot fail a regex it should have passed.
    mobile: normalizeMobile(mobile),
  }

  if (whoYouAre?.trim()) body.whoYouAre = whoYouAre.trim()
  if (lookingFor?.trim()) body.lookingFor = lookingFor.trim()
  if (location?.trim()) body.location = location.trim()
  if (message?.trim()) body.message = message.trim()

  /*
   * Honeypot. The backend treats a non-empty `website` as a bot and returns the
   * same 201 and body shape as a real submission, so it must be sent even when
   * empty — omitting it entirely is fine (null is not a hit), but sending it
   * keeps the decoy's presence obvious to anyone reading this payload.
   */
  body.website = website ?? ''

  return body
}

/**
 * POST /api/contact-messages → 201
 *
 * Deliberately does NOT route through mocks/mockGateway.js: there is no
 * mockSubmitContact, and adding one would mean this form silently stops posting
 * whenever VITE_USE_MOCKS is 'true' — which it currently is in
 * .env.development. This endpoint is live, so it posts live.
 *
 * A 400 rejects with an ApiError carrying `fieldErrors`, keyed by the backend's
 * field names. Note `phone`: server-side errors on the number come back under
 * the canonical name even though we send `mobile`, so the caller has to map it.
 *
 * @throws {import('../utils/apiError.js').ApiError}
 */
export async function submit(payload, { signal } = {}) {
  const { data } = await apiClient.post(
    '/api/contact-messages',
    toRequestBody(payload),
    { signal },
  )
  return data
}

export default { submit }
