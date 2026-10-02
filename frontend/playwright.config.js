import { defineConfig, devices } from '@playwright/test'

/*
 * End-to-end tests. They build the app with the chatbot flag on and mocks off,
 * then serve that production bundle with `vite preview` on a dedicated port.
 * The UI talks to the "network", which every spec stubs with page.route, so no
 * test ever reaches the Spring backend or Gemini.
 *
 * A production build rather than the dev server, deliberately: `vite dev`
 * re-optimizes dependencies when the lockfile changes and force-reloads open
 * pages mid-test, which made runs flaky. The build also exercises the real
 * lazy-loaded chat chunk.
 *
 * @playwright/test is pinned (package.json) so its Chromium build matches the
 * one installed locally; after bumping it, run `npx playwright install chromium`.
 */
const PORT = 5179
const OUT_DIR = '.e2e-dist' // git-ignored; never the real dist/

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Playwright's default (half the cores) starved a 16-thread dev laptop that
  // was also running an IDE and a browser: keystrokes took seconds and tests
  // timed out. Four browsers keep a full run around half a minute.
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite build --outDir ${OUT_DIR} --emptyOutDir && npx vite preview --outDir ${OUT_DIR} --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_CHATBOT_ENABLED: 'true',
      VITE_USE_MOCKS: 'false',
      // Same-origin /api: every call is intercepted by the specs' page.route.
      VITE_API_BASE_URL: '',
    },
  },
})
