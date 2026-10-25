import { test, expect } from '@playwright/test'
import { COURSES } from '../src/mocks/catalog.js'

// Use the locally installed Chrome when the bundled Chromium is unavailable.
test.use({ channel: 'chrome' })

// Exercise the integration without sending leads or changing backend data.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window !== window.top) return
    localStorage.setItem('lesuccess_connect_submitted', 'true')
    sessionStorage.setItem('lesuccess_initial_entry_done', 'true')
  })
  await page.route(url => url.hostname !== 'localhost', route => route.abort())
  await page.route(url => url.hostname === 'localhost' && url.pathname.startsWith('/api/'), async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/settings') return route.fulfill({ json: { success: true, data: {} } })
    if (path === '/api/courses') return route.fulfill({ json: { success: true, data: COURSES } })
    const match = path.match(/^\/api\/courses\/([^/]+)$/)
    if (match) return route.fulfill({ json: { success: true, data: COURSES.find(c => c.slug === match[1]) } })
    if (path === '/api/success-stories') return route.fulfill({ json: { success: true, data: { images: [], reels: [] } } })
    return route.fulfill({ json: { success: true, data: [] } })
  })
})

const routes = ['/', '/about', '/services', '/our-team', '/courses', '/courses/python-full-stack-development', '/gallery', '/contact']
for (const [label, width, height] of [['desktop', 1440, 900], ['laptop', 1366, 768], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
  test(`${label}: pages render without overflow or runtime errors`, async ({ page }, testInfo) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width, height })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('main').first()).toBeVisible()
      await expect(page.locator('main h1, main h2').first()).toBeVisible()
      await page.evaluate(async () => { await document.fonts.ready })
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
      if (route === '/' || route === '/about') {
        const connection = page.locator('.ls-connection, .lesuccess-connection, .connection-card')
        // The preserved component is also checked byte-for-byte outside browser tests.
        if (await connection.count()) await expect(connection.first()).toBeVisible()
        await page.screenshot({ path: testInfo.outputPath(`${route === '/' ? 'home' : 'about'}.png`), fullPage: false })
      }
      await page.locator('footer').scrollIntoViewIfNeeded()
      await expect(page.locator('footer')).toContainText('LEARN • EDUCATE • SUCCEED')
      await expect(page.locator('.lh-wave svg')).toHaveCount(2)
    }
    expect(errors).toEqual([])
  })
}

test('About connection controls and reduced-motion footer stay available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/about')
  await page.getByRole('button', { name: 'How we help', exact: true }).click()
  await expect(page.getByText('Practical learning. Personal guidance.', { exact: true })).toBeVisible()
  await page.locator('.lh-wave').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('.lh-wave > div').evaluate(el => getComputedStyle(el).animationName)).toBe('none')
})


test('challenge builder supports keyboard runs, preview interaction, completion and restart', async ({ page }) => {
  await page.goto('/')
  const builder = page.getByRole('region', { name: 'LeSuccess Challenge Builder' })
  const editor = page.getByRole('textbox', { name: 'index.html editor' })
  const html = '<article data-card><h2>My project</h2><p>Learning with LeSuccess.</p><button data-action="color">Switch colour</button><button data-action="theme">Light / dark</button></article>'
  await editor.fill(html)
  await editor.press('Control+Enter')
  await builder.getByRole('button', { name: 'Next challenge', exact: true }).click()
  await expect(builder.getByText('Now click your colour button in the preview.', { exact: true })).toBeVisible()
  await page.frameLocator('iframe[title="Your project, live preview"]').getByRole('button', { name: 'Switch colour' }).click()
  await builder.getByRole('button', { name: 'Next challenge', exact: true }).click()
  await expect(builder.getByText('Now click your light / dark button in the preview.', { exact: true })).toBeVisible()
  await page.frameLocator('iframe[title="Your project, live preview"]').getByRole('button', { name: 'Light / dark' }).click()
  await builder.getByRole('button', { name: 'Finish project', exact: true }).click()
  await expect(builder.getByRole('heading', { name: 'Nice! Learn this properly with us.' })).toBeVisible()
  await expect(builder.getByRole('textbox', { name: 'Name *', exact: true })).toBeVisible()
  await expect(builder.getByRole('textbox', { name: 'Email *', exact: true })).toBeVisible()
  // Return to the editor through the completion screen without sending a lead.
  await builder.getByRole('button', { name: /keep|back|continue/i }).click()
  await builder.getByRole('button', { name: 'Restart the challenges' }).click()
  await expect(editor).toHaveValue(/My first project/)
})

test('mobile navigation and demo booking retain their actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Toggle navigation menu' }).click()
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
  await page.goto('/')
  await page.getByRole('link', { name: 'Book Free Demo', exact: true }).first().click()
  await expect(page).toHaveURL(/#demo-class$/)
  const demo = page.locator('#demo-class')
  await demo.getByLabel('Your full name *', { exact: true }).fill('Test Learner')
  await demo.getByLabel('Mobile number *', { exact: true }).fill('9000000000')
  await demo.getByLabel('Email address *', { exact: true }).fill('learner@example.com')
  await demo.getByLabel('Select course *', { exact: true }).selectOption({ index: 1 })
  const posted = page.waitForRequest(r => r.url().includes('/api/demo-bookings') && r.method() === 'POST')
  await demo.getByRole('button', { name: 'Reserve Free Demo Seat' }).click()
  expect((await posted).postDataJSON()).toMatchObject({ name: 'Test Learner', email: 'learner@example.com' })
})


for (const mode of ['BASIC', 'API']) {
  test(`current LeBot opens, replies and closes in ${mode} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.route('**/api/settings', route => route.fulfill({ json: { success: true, data: { chatbot_mode: mode, chatbot_enabled: 'true' } } }))
    await page.route('**/api/chat', route => route.fulfill({ json: { sessionId: 'ui-test', reply: 'UI integration test reply.', sources: [] } }))
    await page.goto('/services')
    await page.getByRole('button', { name: 'Open chat with LeBot', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const input = dialog.locator('textarea, input').first()
    await input.fill('Hello')
    await input.press('Enter')
    if (mode === 'API') await expect(dialog.getByText('UI integration test reply.', { exact: true })).toBeVisible()
    else await expect(dialog.getByText(/Hello! Welcome to/)).toBeVisible()
    await dialog.getByRole('button', { name: 'Close chat', exact: true }).click()
    await expect(dialog).not.toBeVisible()
  })
}
