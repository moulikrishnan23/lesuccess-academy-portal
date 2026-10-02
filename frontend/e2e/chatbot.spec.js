import { test, expect } from '@playwright/test'
import { COURSES } from '../src/mocks/catalog.js'

/*
 * The chatbot widget, end to end in a real browser. Every /api call is stubbed
 * with page.route, so these never reach the backend or Gemini: /api/chat by a
 * per-test handler, everything else by an empty-but-valid catch-all so the
 * pages around the widget render.
 */

const LAUNCHER = { name: 'Open chat with LeSuccess assistant' }
const DIALOG = { name: 'LeSuccess Assistant' }
const COURSE_SLUG = 'python-full-stack-development'

const RATE_LIMIT_TEXT = "You're sending messages too quickly. Please wait a minute and try again."
const UNAVAILABLE_TEXT =
  "I'm having trouble right now. Please try again shortly, or contact our team directly."

/** Empty but well-formed answers for every non-chat endpoint the pages call. */
async function stubSiteApi(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const { pathname } = new URL(request.url())

    if (request.method() !== 'GET') {
      return route.fulfill({ status: 404, json: { success: false, message: 'Not stubbed' } })
    }
    if (pathname === '/api/settings') {
      return route.fulfill({ json: { success: true, data: {} } })
    }
    const courseMatch = pathname.match(/^\/api\/courses\/([^/]+)$/)
    if (courseMatch) {
      const course = COURSES.find((item) => item.slug === decodeURIComponent(courseMatch[1]))
      return course
        ? route.fulfill({ json: { success: true, data: course } })
        : route.fulfill({ status: 404, json: { success: false, message: 'Not found' } })
    }
    return route.fulfill({ json: { success: true, data: [] } })
  })
}

/**
 * Stub POST /api/chat. `respond(body, index)` returns { status?, json?, delayMs? }.
 * Registered after the catch-all, so it wins (Playwright runs the newest route first).
 * @returns {Object[]} every request body, in order
 */
async function stubChat(page, respond) {
  const calls = []
  await page.route('**/api/chat', async (route) => {
    const body = route.request().postDataJSON()
    calls.push(body)
    const { status = 200, json, delayMs = 0 } = respond(body, calls.length - 1) ?? {}
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
    await route.fulfill({ status, json: json ?? {} })
  })
  return calls
}

const ok = (reply, extra = {}) => ({
  json: { sessionId: 'sess-123', reply, sources: [], ...extra },
})
const fail = (status) => ({ status, json: { success: false, message: 'stubbed failure' } })

async function openChat(page) {
  await page.getByRole('button', LAUNCHER).click()
  const dialog = page.getByRole('dialog', DIALOG)
  await expect(dialog).toBeVisible()
  return dialog
}

function chatInput(page) {
  return page.getByRole('dialog', DIALOG).getByRole('textbox', { name: 'Type your message' })
}

function messageList(page) {
  return page.getByTestId('chat-messages')
}

test.beforeEach(async ({ page }) => {
  // Keep the scroll-triggered "Connect with us" popup from covering the widget.
  await page.addInitScript(() => {
    localStorage.setItem('lesuccess_connect_submitted', 'true')
  })
  // Hermetic: no fonts, images or embeds from the internet. Besides keeping the
  // tests offline, a slow third-party request would otherwise hold up `load`.
  await page.route((url) => url.hostname !== 'localhost', (route) => route.abort())
  await stubSiteApi(page)
})

test.describe('chatbot widget', () => {
  test('the window code loads only on the first launcher click', async ({ page }) => {
    const loaded = []
    page.on('request', (request) => {
      if (/ChatWindow|useChat|chatApi/.test(request.url())) loaded.push(request.url())
    })
    await page.goto('/services')
    await expect(page.getByRole('button', LAUNCHER)).toBeVisible()
    expect(loaded).toEqual([])

    await openChat(page)
    expect(loaded.some((url) => url.includes('ChatWindow'))).toBe(true)
  })

  test('the launcher opens the window and focuses the input', async ({ page }) => {
    await page.goto('/services')
    await openChat(page)

    await expect(chatInput(page)).toBeFocused()
    await expect(page.getByRole('button', LAUNCHER)).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('Hi! I can help you with our courses, services and upcoming webinars.')).toBeVisible()
  })

  test('a quick-reply chip sends immediately and shows the reply', async ({ page }) => {
    const calls = await stubChat(page, () => ok('We offer 20 courses, from Python to Cybersecurity.'))
    await page.goto('/services')
    const dialog = await openChat(page)

    await dialog.getByRole('button', { name: 'What courses do you offer?' }).click()

    await expect(messageList(page).getByText('We offer 20 courses, from Python to Cybersecurity.')).toBeVisible()
    await expect(messageList(page).locator('[data-role="user"]')).toHaveText('What courses do you offer?')
    expect(calls).toEqual([{ message: 'What courses do you offer?' }])
    // No fee chip is offered.
    await expect(dialog.getByRole('button', { name: /fee/i })).toHaveCount(0)
  })

  test('Enter sends; Shift+Enter inserts a newline', async ({ page }) => {
    const calls = await stubChat(page, () => ok('Got it.'))
    await page.goto('/services')
    await openChat(page)
    const input = chatInput(page)

    // fill() for the text, real key presses for what is under test.
    await input.fill('line one')
    await input.press('End')
    await input.press('Shift+Enter')
    await input.pressSequentially('line two')
    await expect(input).toHaveValue('line one\nline two')
    expect(calls).toHaveLength(0)

    await input.press('Enter')
    await expect(messageList(page).getByText('Got it.')).toBeVisible()
    expect(calls).toEqual([{ message: 'line one\nline two' }])
    await expect(input).toHaveValue('')
  })

  test('the returned sessionId is sent with the second message', async ({ page }) => {
    const calls = await stubChat(page, (_body, index) => ok(index === 0 ? 'First answer.' : 'Second answer.'))
    await page.goto('/services')
    await openChat(page)
    const input = chatInput(page)

    await input.fill('Hello')
    await input.press('Enter')
    await expect(messageList(page).getByText('First answer.')).toBeVisible()
    await input.fill('And another thing')
    await input.press('Enter')
    await expect(messageList(page).getByText('Second answer.')).toBeVisible()

    expect(calls[0]).toEqual({ message: 'Hello' })
    expect(calls[1]).toEqual({ message: 'And another thing', sessionId: 'sess-123' })
    expect(await page.evaluate(() => sessionStorage.getItem('ls_chat_session'))).toBe('"sess-123"')
    expect(await page.evaluate(() => localStorage.getItem('ls_chat_session'))).toBeNull()
  })

  test('a 400 with a sessionId triggers exactly one retry without it', async ({ page }) => {
    const calls = await stubChat(page, (body, index) => {
      if (index === 0) return ok('Welcome.', { sessionId: 'sess-old' })
      if (body.sessionId) return fail(400)
      return ok('Fresh start.', { sessionId: 'sess-new' })
    })
    await page.goto('/services')
    await openChat(page)
    const input = chatInput(page)

    await input.fill('First')
    await input.press('Enter')
    await expect(messageList(page).getByText('Welcome.')).toBeVisible()
    await input.fill('Second')
    await input.press('Enter')
    await expect(messageList(page).getByText('Fresh start.')).toBeVisible()

    expect(calls).toEqual([
      { message: 'First' },
      { message: 'Second', sessionId: 'sess-old' },
      { message: 'Second' },
    ])
    // The old conversation went with the old session.
    await expect(messageList(page).getByText('Welcome.')).toHaveCount(0)
    expect(await page.evaluate(() => sessionStorage.getItem('ls_chat_session'))).toBe('"sess-new"')
  })

  test('if the retry also fails, the generic error is shown and nothing more is sent', async ({ page }) => {
    const calls = await stubChat(page, (_body, index) => (index === 0 ? ok('Welcome.') : fail(400)))
    await page.goto('/services')
    await openChat(page)
    const input = chatInput(page)

    await input.fill('First')
    await input.press('Enter')
    await expect(messageList(page).getByText('Welcome.')).toBeVisible()
    await input.fill('Second')
    await input.press('Enter')

    await expect(messageList(page).getByText(UNAVAILABLE_TEXT)).toBeVisible()
    expect(calls).toHaveLength(3)
  })

  test('a 404 hides the widget entirely', async ({ page }) => {
    const calls = await stubChat(page, () => fail(404))
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Hello?')
    await chatInput(page).press('Enter')

    await expect(page.getByRole('dialog', DIALOG)).toHaveCount(0)
    await expect(page.getByRole('button', LAUNCHER)).toHaveCount(0)
    expect(calls).toHaveLength(1)
  })

  test('429 shows the rate-limit message', async ({ page }) => {
    await stubChat(page, () => fail(429))
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Hi')
    await chatInput(page).press('Enter')

    await expect(messageList(page).getByText(RATE_LIMIT_TEXT)).toBeVisible()
    await expect(messageList(page).getByRole('link', { name: 'Contact us' })).toHaveCount(0)
  })

  test('503 shows the unavailable message with a Contact link', async ({ page }) => {
    await stubChat(page, () => fail(503))
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Hi')
    await chatInput(page).press('Enter')

    await expect(messageList(page).getByText(UNAVAILABLE_TEXT)).toBeVisible()
    await expect(messageList(page).getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact')
  })

  test('a network failure is treated like 503', async ({ page }) => {
    await page.route('**/api/chat', (route) => route.abort('connectionrefused'))
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Hi')
    await chatInput(page).press('Enter')

    await expect(messageList(page).getByText(UNAVAILABLE_TEXT)).toBeVisible()
  })

  test('HTML in a reply is shown as literal text, never rendered', async ({ page }) => {
    const payload = '<img src=x onerror=alert(1)>'
    let dialogFired = false
    page.on('dialog', async (dialog) => {
      dialogFired = true
      await dialog.dismiss()
    })
    await stubChat(page, () => ok(`Here you go: ${payload}`))
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Show me something')
    await chatInput(page).press('Enter')

    await expect(messageList(page).getByText(`Here you go: ${payload}`)).toBeVisible()
    await expect(messageList(page).locator('img')).toHaveCount(0)
    expect(dialogFired).toBe(false)
  })

  test('only internal sources become links; javascript:, external and protocol-relative URLs do not', async ({ page }) => {
    await stubChat(page, () =>
      ok('See these.', {
        sources: [
          { type: 'COURSE', sourceUrl: 'javascript:alert(1)' },
          { type: 'SERVICE', sourceUrl: 'https://evil.example' },
          { type: 'COURSE', sourceUrl: '//evil.example/courses/x' },
          { type: 'COURSE', sourceUrl: `/courses/${COURSE_SLUG}` },
          { type: 'COURSE_MODULE', sourceUrl: `/courses/${COURSE_SLUG}` },
          { type: 'SERVICE', sourceUrl: '/services' },
        ],
      }),
    )
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Sources please')
    await chatInput(page).press('Enter')
    await expect(messageList(page).getByText('See these.')).toBeVisible()

    const links = messageList(page).getByRole('link')
    await expect(links).toHaveCount(2)
    await expect(links.nth(0)).toHaveAttribute('href', `/courses/${COURSE_SLUG}`)
    await expect(links.nth(0)).toHaveText('View course')
    await expect(links.nth(1)).toHaveAttribute('href', '/services')
    await expect(links.nth(1)).toHaveText('View service')
    await expect(messageList(page).locator('a[href*="evil"], a[href^="javascript"]')).toHaveCount(0)
  })

  test('Esc closes the window and returns focus to the launcher', async ({ page }) => {
    await page.goto('/services')
    await openChat(page)
    await expect(chatInput(page)).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog', DIALOG)).toHaveCount(0)
    await expect(page.getByRole('button', LAUNCHER)).toBeFocused()
    await expect(page.getByRole('button', LAUNCHER)).toHaveAttribute('aria-expanded', 'false')
  })

  test('a reply that arrives while the window is closed shows the unread dot', async ({ page }) => {
    await stubChat(page, () => ({ ...ok('Sorry for the wait.'), delayMs: 800 }))
    await page.goto('/services')
    await openChat(page)

    await chatInput(page).fill('Hello')
    await chatInput(page).press('Enter')
    await page.keyboard.press('Escape')

    await expect(page.getByTestId('chat-unread-dot')).toBeVisible()
    await page.getByRole('button', LAUNCHER).click()
    await expect(page.getByTestId('chat-unread-dot')).toHaveCount(0)
    await expect(messageList(page).getByText('Sorry for the wait.')).toBeVisible()
  })

  test('the character counter appears after 400 characters and input stops at 500', async ({ page }) => {
    await page.goto('/services')
    await openChat(page)
    const input = chatInput(page)

    await input.fill('a'.repeat(400))
    await expect(page.getByTestId('chat-char-counter')).toHaveCount(0)
    await input.fill('a'.repeat(401))
    await expect(page.getByTestId('chat-char-counter')).toHaveText('401/500')
    await input.fill('a'.repeat(600))
    await expect(input).toHaveValue('a'.repeat(500))
  })

  test('desktop: the launcher sits above BackToTop without overlapping it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/services')
    await page.mouse.wheel(0, 1500)
    const backToTop = page.getByRole('button', { name: 'Back to top' })
    await expect(backToTop).toBeVisible()

    expectNoOverlap(await page.getByRole('button', LAUNCHER).boundingBox(), await backToTop.boundingBox(), 'BackToTop')
  })
})

test.describe('chatbot widget on a 375x812 phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })

  test('the window is a full-screen sheet and locks page scroll', async ({ page }) => {
    await page.goto('/services')
    // Not necessarily "": CourseEnquiryModal writes "unset" on mount. The lock
    // must hand back whatever was there, not clobber it.
    const overflowBefore = await page.evaluate(() => document.body.style.overflow)
    const dialog = await openChat(page)

    await expect.poll(async () => dialog.boundingBox()).toEqual({ x: 0, y: 0, width: 375, height: 812 })
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    await dialog.getByRole('button', { name: 'Close chat' }).click()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(overflowBefore)
  })

  test('on course detail the launcher clears the section bar, the navbar and BackToTop', async ({ page }) => {
    await page.goto(`/courses/${COURSE_SLUG}`)
    const launcher = page.getByRole('button', LAUNCHER)
    const sectionBar = page.getByRole('navigation', { name: 'Mobile course section navigation' })
    await expect(sectionBar).toBeVisible()
    await page.mouse.wheel(0, 1500)
    const backToTop = page.getByRole('button', { name: 'Back to top' })
    await expect(backToTop).toBeVisible()

    const launcherBox = await launcher.boundingBox()
    expectNoOverlap(launcherBox, await sectionBar.boundingBox(), 'course section bar')
    expectNoOverlap(launcherBox, await backToTop.boundingBox(), 'BackToTop')
    expectNoOverlap(launcherBox, await mobileNavbarBox(page), 'mobile navbar')
    // There is no WhatsApp float button on the site to clear.
    await expect(page.locator('a[href*="wa.me"].fixed, a[href*="whatsapp"].fixed')).toHaveCount(0)
  })

  test('on other pages the launcher clears the navbar and BackToTop', async ({ page }) => {
    await page.goto('/services')
    await page.mouse.wheel(0, 1500)
    const backToTop = page.getByRole('button', { name: 'Back to top' })
    await expect(backToTop).toBeVisible()

    const launcherBox = await page.getByRole('button', LAUNCHER).boundingBox()
    expectNoOverlap(launcherBox, await backToTop.boundingBox(), 'BackToTop')
    expectNoOverlap(launcherBox, await mobileNavbarBox(page), 'mobile navbar')
  })
})

/** The bottom-fixed site navbar below lg: the fixed element whose bottom is the viewport's. */
async function mobileNavbarBox(page) {
  return page.evaluate(() => {
    const candidates = [...document.querySelectorAll('div.fixed.z-50')]
    const navbar = candidates.find((el) => getComputedStyle(el).bottom === '0px')
    const rect = navbar.getBoundingClientRect()
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  })
}

function expectNoOverlap(a, b, label) {
  expect(a, 'launcher box').not.toBeNull()
  expect(b, `${label} box`).not.toBeNull()
  const overlaps =
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  expect(overlaps, `launcher overlaps ${label}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`).toBe(false)
}
