import axios from 'axios'
import { toApiError } from '../utils/apiError.js'

/**
 * The single axios instance for the app. Every service imports this — do not
 * create another, or interceptors and auth headers will diverge.
 */
/** Production backend URL deployed on Render. */
export const DEFAULT_PRODUCTION_API_URL = 'https://lesuccess-academy-portal.onrender.com'

/**
 * Normalizes the API base URL:
 * - Trims whitespace
 * - Strips trailing slashes
 * - Strips trailing '/api' to prevent duplicate '/api/api/...' paths since service routes include '/api/...'
 * - Guards against localhost in production mode (e.g. if built with a stale local .env)
 * - Defaults to the deployed production backend in production when no custom URL is provided
 */
export function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim()) {
    const cleaned = raw.trim().replace(/\/+$/, '').replace(/\/api$/, '')
    // In production builds, guard against lingering localhost configurations
    if (import.meta.env.PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(cleaned)) {
      return DEFAULT_PRODUCTION_API_URL
    }
    return cleaned
  }
  // Production fallback if VITE_API_BASE_URL is undefined (not set at build time)
  // Note: Playwright e2e explicitly sets VITE_API_BASE_URL: '' (empty string), so it uses '' for same-origin routing
  if (import.meta.env.PROD && raw === undefined) {
    return DEFAULT_PRODUCTION_API_URL
  }
  return ''
}

export const API_BASE_URL = resolveApiBaseUrl()

/**
 * The single axios instance for the app. Every service imports this — do not
 * create another, or interceptors and auth headers will diverge.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 300s (5 min) to allow Render Free Tier cold starts
  headers: { 'Content-Type': 'application/json' },
})

// Safe retry for idempotent GET requests on network failures / timeouts (e.g. backend spin-up)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config
    if (
      config &&
      config.method?.toLowerCase() === 'get' &&
      !config._retry &&
      (error.code === 'ECONNABORTED' ||
        !error.response ||
        error.response.status === 502 ||
        error.response.status === 503 ||
        error.response.status === 504)
    ) {
      config._retry = true
      // Wait 3s before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return apiClient(config)
    }
    return Promise.reject(toApiError(error))
  },
)

export default apiClient
