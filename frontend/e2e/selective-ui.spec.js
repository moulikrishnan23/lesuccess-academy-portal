import { test, expect } from '@playwright/test'
import { COURSES } from '../src/mocks/catalog.js'

// Use the locally installed Chrome when the bundled Chromium is unavailable.
test.use({ channel: 'chrome' })

// Exercise the integration without sending leads or changing backend data.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window !== window.top) return
    sessionStorage.setItem('lesuccess_connect_submitted', 'true')
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
  const preview = page.locator('iframe[title="Your project, live preview"]')
  // Feedback updates before the sandbox document finishes navigating. Wait for
  // its new run token so the click cannot land in the previous preview.
  const waitForPreview = async () => {
    const token = (await preview.getAttribute('srcdoc')).match(/var T=("[^"]+");/)[1]
    await expect.poll(async () => {
      try { return (await preview.contentFrame().locator('html').innerHTML()).includes(`var T=${token};`) }
      catch { return false }
    }).toBe(true)
  }
  const html = '<article data-card><h2>My project</h2><p>Learning with LeSuccess.</p><button data-action="color">Switch colour</button><button data-action="theme">Light / dark</button></article>'
  await editor.fill(html)
  await editor.press('Control+Enter')
  await builder.getByRole('button', { name: 'Next challenge', exact: true }).click()
  await expect(builder.getByText('Now click your colour button in the preview.', { exact: true })).toBeVisible()
  await waitForPreview()
  await page.frameLocator('iframe[title="Your project, live preview"]').getByRole('button', { name: 'Switch colour' }).click()
  await builder.getByRole('button', { name: 'Next challenge', exact: true }).click()
  await expect(builder.getByText('Now click your light / dark button in the preview.', { exact: true })).toBeVisible()
  await waitForPreview()
  await page.frameLocator('iframe[title="Your project, live preview"]').getByRole('button', { name: 'Light / dark' }).click()
  await builder.getByRole('button', { name: 'Finish project', exact: true }).click()
  await expect(builder.getByRole('heading', { name: 'Nice! Learn this properly with us.' })).toBeVisible()
  await expect(builder.getByRole('textbox', { name: 'Name *', exact: true })).toBeVisible()
  await expect(builder.getByRole('textbox', { name: 'Email *', exact: true })).toBeVisible()
  // Return to the editor through the completion screen without sending a lead.
  await builder.getByRole('button', { name: /keep|back|continue/i }).click()
  await builder.getByLabel('Playground tools', { exact: true }).click()
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
    // The source launcher floats continuously; keyboard activation avoids
    // Playwright waiting indefinitely for its bounding box to stop moving.
    await page.getByRole('button', { name: 'Open chat with LeBot', exact: true }).focus()
    await page.keyboard.press('Enter')
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


test('source header dropdown, sticky behavior and About beams remain interactive', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  const nav = page.getByRole('navigation').first()
  const courses = nav.getByRole('link', { name: 'Courses', exact: true })
  await courses.hover()
  await expect(courses).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByText('Popular Programs')).toBeVisible()
  await courses.press('Escape')
  await expect(courses).toHaveAttribute('aria-expanded', 'false')
  const about = page.locator('#about-section')
  await about.scrollIntoViewIfNeeded()
  const beams = about.locator('[style*="--size"]')
  await expect(beams).toHaveCount(3)
  expect(await beams.evaluateAll(els => els.map(el => ({
    duration: getComputedStyle(el.firstElementChild).animationDuration,
    delay: getComputedStyle(el.firstElementChild).animationDelay,
    mask: getComputedStyle(el).maskComposite,
  })))).toEqual([0, 2, 4].map(delay => ({duration:'7s', delay:delay ? `-${delay}s` : '0s',mask:'exclude, exclude'})))
  const streak = beams.first().locator('div')
  const position = await streak.evaluate(el => getComputedStyle(el).offsetDistance)
  await expect.poll(() => streak.evaluate(el => getComputedStyle(el).offsetDistance)).not.toBe(position)
  const card = about.locator('.card-lift-3d').first()
  await card.hover({position:{x:25,y:25}})
  await expect.poll(() => card.evaluate(el => el.style.transform)).toContain('rotate')
  await page.mouse.move(5, 400)
  await expect(page.getByRole('button', {name:'Enroll Now', exact:true}).first()).toBeInViewport()
  await about.screenshot({path:testInfo.outputPath('about-animation.png')})
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect(about).toHaveClass(/ls-motion-paused/)
  await expect.poll(() => streak.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused')
  await expect(page.locator('footer')).toContainText('Build your future.')
  await page.locator('footer').screenshot({path:testInfo.outputPath('footer.png')})
})

test('Results reveal retains source timing and settles without moving the layout', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('#numbers .lh-stat.motion-reveal')
  await expect(cards.first()).not.toHaveClass(/is-in/)
  await page.locator('#numbers').scrollIntoViewIfNeeded()
  await expect(cards.first()).toHaveClass(/is-in/)
  await expect.poll(() => cards.first().evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  const timing = await cards.first().evaluate(el => getComputedStyle(el).transitionDuration)
  // Source .lh-stat overrides the base reveal duration with 0.4s.
  expect(timing).toBe('0.4s, 0.4s')
  expect(await cards.evaluateAll(els => els.map(el => el.style.getPropertyValue('--reveal-i')))).toEqual(['0','1','2','3'])
  const before = await cards.first().evaluate(el => ({top:el.offsetTop,height:el.offsetHeight}))
  await page.locator('footer').scrollIntoViewIfNeeded()
  await page.locator('#numbers').scrollIntoViewIfNeeded()
  expect(await cards.first().evaluate(el => ({top:el.offsetTop,height:el.offsetHeight}))).toEqual(before)
})

test('source Connect form retains validation, payload, failure feedback and success', async ({ page }) => {
  let payload
  let attempt = 0
  await page.route('**/api/connect-with-us', route => {
    payload = route.request().postDataJSON()
    attempt++
    return attempt === 1
      ? route.fulfill({status:500,json:{success:false,message:'Please try again later'}})
      : route.fulfill({json:{success:true,data:{id:'test-only'}}})
  })
  await page.goto('/')
  const form = page.locator('#connect-with-us-section')
  await form.scrollIntoViewIfNeeded()
  await form.getByRole('button',{name:'Submit Inquiry'}).click()
  expect(attempt).toBe(0)
  await form.getByLabel('Name *',{exact:true}).fill('Test Learner')
  await form.getByLabel('Email *',{exact:true}).fill('learner@example.com')
  await form.getByLabel('Phone number *',{exact:true}).fill('9000000000')
  await form.getByLabel('Message (optional)',{exact:true}).fill('A test inquiry')
  await form.getByRole('button',{name:'Submit Inquiry'}).click()
  await expect(form.getByRole('alert')).toBeVisible()
  await form.getByRole('button',{name:'Submit Inquiry'}).click()
  await expect(form.getByRole('heading',{name:'Thanks for connecting'})).toBeVisible()
  expect(payload).toMatchObject({name:'Test Learner',email:'learner@example.com',mobile:'9000000000',message:'A test inquiry'})
})

test('reduced motion removes About beams and keeps protected illustrations intact', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  const about = page.locator('#about-section')
  await about.scrollIntoViewIfNeeded()
  await expect(about.locator('[style*="--size"]')).toHaveCount(0)
  await expect(about.locator('.ls-connection')).toBeVisible()
  await expect(page.locator('[data-preserve-ui]')).toHaveCount(2)
  await expect(page.locator('body')).not.toHaveClass(/has-custom-cursor/)
})


test('hero video pauses off screen and resumes; protected UI keeps its native cursor', async ({ page }) => {
  await page.setViewportSize({width:1366,height:768})
  await page.goto('/')
  const video = page.locator('main video').first()
  await expect.poll(() => video.evaluate(el => !el.paused && el.readyState >= 2)).toBe(true)
  await page.locator('#numbers').scrollIntoViewIfNeeded()
  await expect.poll(() => video.evaluate(el => el.paused)).toBe(true)
  await page.locator('#about-section .ls-connection').hover()
  await expect(page.locator('body')).toHaveClass(/has-native-cursor/)
  await page.locator('#about-section .card-lift-3d').first().hover()
  await expect(page.locator('body')).not.toHaveClass(/has-native-cursor/)
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}))
  await expect.poll(() => video.evaluate(el => !el.paused)).toBe(true)
})

test('the global custom cursor stays enabled through protected Home motion sections', async ({ page }) => {
  await page.setViewportSize({width:1366,height:768})
  await page.route('**/api/success-stories', route => route.fulfill({
    json: {success:true,data:{images:[{id:'cursor-test-story',imageUrl:'/cursor-test.jpg',isActive:true}],reels:[]}},
  }))
  await page.goto('/')
  const body = page.locator('body')
  const protectedSections = page.locator('[data-preserve-ui].contents > section')
  await expect(protectedSections).toHaveCount(4)

  for (let index = 0; index < await protectedSections.count(); index += 1) {
    await protectedSections.nth(index).hover()
    await expect(body).toHaveClass(/has-custom-cursor/)
    await expect(body).not.toHaveClass(/has-native-cursor/)
  }
})

test('the custom cursor remains mounted across all public pages', async ({ page }) => {
  await page.setViewportSize({width:1366,height:768})
  const routes = ['/', '/about', '/services', '/our-team', '/courses', '/gallery', '/contact']

  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('main').first()).toBeVisible()
    await expect(page.locator('body')).toHaveClass(/has-custom-cursor/)
    await expect(page.locator('body')).not.toHaveClass(/has-native-cursor/)
  }
})
