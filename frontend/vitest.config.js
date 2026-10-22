import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/*
 * Unit tests only. Scoped to src/**\/*.test.* on purpose: vitest's default glob
 * also matches e2e/*.spec.js, which belongs to Playwright (npm run test:e2e) and
 * would fail here without a browser.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
