/**
 * Indian mobile numbers are 10 digits starting 6–9. Callers may paste a
 * country code or spaces, so the digits are extracted before checking rather
 * than rejecting a number that is really valid.
 */
export function normalizeMobile(input) {
  const digits = String(input ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

const MOBILE_PATTERN = /^[6-9]\d{9}$/
// Deliberately permissive: the job here is catching typos, not enforcing RFC 5322.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Validate the enroll form.
 *
 * Messages say what to do, not what the user did wrong.
 *
 * @returns {Object} { field: message } — empty when the form is valid.
 */
export function validateEnrollForm({ name, mobile, email }) {
  const errors = {}

  if (!name?.trim()) {
    errors.name = 'Enter your name.'
  } else if (name.trim().length < 2) {
    errors.name = 'Enter your full name.'
  }

  const normalizedMobile = normalizeMobile(mobile)
  if (!normalizedMobile) {
    errors.mobile = 'Enter your mobile number.'
  } else if (!MOBILE_PATTERN.test(normalizedMobile)) {
    errors.mobile = 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.'
  }

  // Email is optional — only validated when something was typed.
  if (email?.trim() && !EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address, or leave this blank.'
  }

  return errors
}

/**
 * Validate the service enquiry form.
 *
 * Different fields from the enroll card, same rules and the same voice: this
 * form asks for a name, an email and what the enquiry is about, and has no
 * mobile field — LeadRequest.mobile is optional for this source.
 *
 * @returns {Object} { field: message } — empty when the form is valid.
 */
export function validateServiceEnquiryForm({ name, email, lookingFor }) {
  const errors = {}

  if (!name?.trim()) {
    errors.name = 'Enter your name.'
  } else if (name.trim().length < 2) {
    errors.name = 'Enter your full name.'
  }

  // Required here, unlike the enroll card — it is the only way back to you.
  if (!email?.trim()) {
    errors.email = 'Enter your email id.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!lookingFor?.trim()) {
    errors.lookingFor = 'Choose what you are looking for.'
  }

  return errors
}
