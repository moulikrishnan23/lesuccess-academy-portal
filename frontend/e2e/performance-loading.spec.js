import { test, expect } from '@playwright/test'

test.use({ channel: 'chrome' })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('lesuccess_initial_entry_done', 'true')
    sessionStorage.setItem('lesuccess_connect_submitted', 'true')
  })
  await page.route(url => url.hostname !== 'localhost', route => route.abort())
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    const data = path === '/api/settings' ? { hero_video_enabled: 'false' } : []
    return route.fulfill({ json: { success: true, data } })
  })
})

test('Team renders without requesting optional category administration', async ({ page }) => {
  const categories = []
  page.on('request', request => {
    if (request.url().endsWith('/api/team-categories')) categories.push(request.url())
  })
  await page.route('**/api/team-members', route => route.fulfill({
    json: { success: true, data: [{ id: 1, name: 'Independent member', role: 'Mentor', isActive: true }] },
  }))
  await page.goto('/our-team')
  await expect(page.getByRole('heading', { name: 'Independent member', exact: true })).toBeVisible()
  expect(categories).toHaveLength(0)
})

test('Gallery reuses root data and renders content before optional parent responds', async ({ page }) => {
  let roots = 0
  let releaseParent
  const parentGate = new Promise(resolve => { releaseParent = resolve })
  await page.route('**/api/gallery/categories', route => {
    roots++
    return route.fulfill({ json: { success: true, data: [{ id: 1, name: 'Sample folder', slug: 'sample' }] } })
  })
  await page.route('**/api/gallery/categories/sample', route => route.fulfill({
    json: { success: true, data: { id: 1, name: 'Sample folder', slug: 'sample', parentId: 2 } },
  }))
  await page.route('**/api/gallery/categories/2', async route => {
    await parentGate
    await route.fulfill({ json: { success: true, data: { id: 2, name: 'Late parent', slug: 'parent' } } }).catch(() => {})
  })
  await page.route('**/api/gallery/categories/1/subcategories', route => route.fulfill({ json: { success: true, data: [] } }))
  await page.route('**/api/gallery/categories/1/images', route => route.fulfill({
    json: { success: true, data: [{ id: 10, url: '/home/team/dummy.png', imageUrl: '/home/team/dummy.png', title: 'Fixture portrait' }] },
  }))
  try {
    await page.goto('/gallery')
    await page.getByText('Sample folder', { exact: true }).click()
    await expect(page.locator('main img').first()).toBeVisible()
    expect(roots).toBe(1)
    await page.getByRole('button', { name: 'Gallery', exact: true }).click()
    releaseParent()
    await expect(page.getByRole('heading', { name: 'Photo Gallery & Moments' })).toBeVisible()
    await expect(page.getByText('Sample folder', { exact: true })).toBeVisible()
    await expect(page.getByText('Late parent', { exact: true })).toHaveCount(0)
    expect(roots).toBe(1)
  } finally { releaseParent() }
})

test('Successful empty responses clear persisted public records', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('lesuccess_cache_team_v1', JSON.stringify({
      savedAt: Date.now(), data: [{ id: 1, name: 'Removed member', isActive: true }],
    }))
  })
  await page.goto('/our-team')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('lesuccess_cache_team_v1')).data)).toEqual([])
  await expect(page.getByRole('heading', { name: 'Removed member', exact: true })).toHaveCount(0)
})

test('Expired public cache is not revived during a network failure', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('lesuccess_cache_team_v1', JSON.stringify({
      savedAt: Date.now() - 24 * 60 * 60 * 1000, data: [{ id: 1, name: 'Expired member' }],
    }))
  })
  await page.route('**/api/team-members', route => route.fulfill({ status: 500, json: { message: 'Test failure' } }))
  await page.goto('/our-team')
  await expect(page.getByRole('heading', { name: 'Expired member', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /retry|try again/i })).toBeVisible()
})

test('Production initial bundle does not fetch mock fixture code', async ({ page }) => {
  const mockRequests = []
  page.on('request', request => {
    if (request.url().includes('mockGateway')) mockRequests.push(request.url())
  })
  await page.goto('/')
  await expect(page.locator('main h1').first()).toBeVisible()
  expect(mockRequests).toEqual([])
})
