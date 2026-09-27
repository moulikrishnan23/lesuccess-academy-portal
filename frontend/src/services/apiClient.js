import axios from 'axios'
import { toApiError } from '../utils/apiError.js'

/**
 * The single axios instance for the app. Every service imports this — do not
 * create another, or interceptors and auth headers will diverge.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
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
