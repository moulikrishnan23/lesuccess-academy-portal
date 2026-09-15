import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  /*
   * `vite preview` serves the PRODUCTION bundle, and Vite loads .env.development
   * only for `vite dev`. There is no .env.production, so VITE_API_BASE_URL is
   * undefined in a build and apiClient falls back to an empty baseURL — which
   * sends every /api/* call to preview's own origin and 404s.
   *
   * The fix is deliberately here and not a baked-in URL: an empty baseURL is the
   * correct default for a deployment that serves the API same-origin behind a
   * reverse proxy, and hardcoding http://localhost:8080 into the bundle would
   * break exactly that setup. So preview is given the same-origin /api the
   * bundle already expects.
   *
   * Deploying somewhere the API is NOT same-origin? Set VITE_API_BASE_URL at
   * build time (CI env var or a .env.production) — see .env.example.
   */
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        /*
         * Chrome sends an Origin header on same-origin POSTs too, and the proxy
         * would forward "http://localhost:4173" — which is not in
         * lesuccess.cors.allowed-origins (dev lists only 5173 and 3000), so
         * Spring Security answers 403 "Invalid CORS request" before the
         * controller is reached.
         *
         * Dropping the header makes this a non-CORS request, which is what it
         * genuinely is once the proxy has made the API same-origin. Preferred
         * over adding 4173 to the backend's allow-list: the fix stays in the
         * tool that created the situation, and dev CORS stays as narrow as it is.
         */
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
