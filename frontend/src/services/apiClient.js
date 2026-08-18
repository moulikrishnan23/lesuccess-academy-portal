import axios from 'axios'
import { toApiError } from '../utils/apiError.js'

/**
 * The single axios instance for the app. Every service imports this — do not
 * create another, or interceptors and auth headers will diverge.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Reject with our normalized ApiError so no component ever touches
// `err.response.data.errors` directly.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
)

export default apiClient
