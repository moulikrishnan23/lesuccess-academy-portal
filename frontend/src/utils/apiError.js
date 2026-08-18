/**
 * One error shape for the whole app, so hooks branch on flags instead of
 * digging through axios internals at every call site.
 *
 * @typedef {Object} ApiError
 * @property {number|null} status      HTTP status, or null when the request never landed.
 * @property {string}      message     Safe to render to a visitor.
 * @property {Object}      fieldErrors { fieldName: message } from a 400, else {}.
 * @property {boolean}     isNotFound  404.
 * @property {boolean}     isValidation 400 carrying field errors.
 * @property {boolean}     isNetwork   Offline, DNS failure, CORS, timeout.
 */

const GENERIC_MESSAGE = "Something went wrong at our end. Please try again."
const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again."

/**
 * The backend returns `{ errors: { field: message } }` on a 400 per the API
 * contract. Some Spring setups instead return `{ fieldErrors: [...] }` or a
 * bare `{ field: message }` — read all three rather than trusting one.
 *
 * TODO(backend): confirm the 400 body once /api/leads is live and drop the
 * shapes that turn out to be unused.
 */
function readFieldErrors(body) {
  if (!body || typeof body !== 'object') return {}

  if (body.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
    return body.errors
  }

  if (Array.isArray(body.fieldErrors)) {
    return body.fieldErrors.reduce((acc, item) => {
      if (item?.field) acc[item.field] = item.defaultMessage || item.message || 'Invalid value'
      return acc
    }, {})
  }

  return {}
}

function readMessage(body, fallback) {
  if (typeof body === 'string' && body.trim()) return body
  return body?.message || body?.error || fallback
}

/**
 * An aborted request is not a failure — React 18+ StrictMode mounts effects
 * twice in development, so the first request is routinely cancelled. Callers
 * check this flag and drop the result silently instead of rendering an error.
 */
function isCanceled(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
}

/** Normalize anything axios rejects with into an ApiError. */
export function toApiError(error) {
  if (isCanceled(error)) {
    return {
      status: null,
      message: 'Request cancelled.',
      fieldErrors: {},
      isNotFound: false,
      isValidation: false,
      isNetwork: false,
      isCanceled: true,
    }
  }

  // No response at all: offline, timeout, CORS, server down.
  if (!error?.response) {
    return {
      status: null,
      message: NETWORK_MESSAGE,
      fieldErrors: {},
      isNotFound: false,
      isValidation: false,
      isNetwork: true,
      isCanceled: false,
    }
  }

  const { status, data } = error.response
  const fieldErrors = status === 400 ? readFieldErrors(data) : {}

  return {
    status,
    message:
      status === 404
        ? 'Not found.'
        : readMessage(data, GENERIC_MESSAGE),
    fieldErrors,
    isNotFound: status === 404,
    isValidation: status === 400,
    isNetwork: false,
    isCanceled: false,
  }
}

/** Build an ApiError by hand — used by the mock gateway. */
export function makeApiError(status, message, fieldErrors = {}) {
  return {
    status,
    message,
    fieldErrors,
    isNotFound: status === 404,
    isValidation: status === 400,
    isNetwork: status === null,
    isCanceled: false,
  }
}
