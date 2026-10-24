import { describe, expect, it } from 'vitest'
import {
  MISSIONS,
  STARTER_FILES,
  buildPreviewDoc,
  checkProject,
  highlight,
  insertSnippet,
  isPreviewMessage,
  missionReady,
} from './challenges.js'

describe('checkProject', () => {
  it('starts with no mission solved', () => {
    expect(checkProject(STARTER_FILES.html)).toEqual({ card: false, color: false, theme: false })
  })

  it('passes each mission once its snippet is added', () => {
    let html = STARTER_FILES.html
    for (const mission of MISSIONS) {
      html = insertSnippet(html, mission.snippet)
      expect(missionReady(mission, checkProject(html))).toBe(true)
    }
  })

  it('ignores buttons outside the card and empty buttons', () => {
    const html = `<article data-card><h2>Hi</h2><p>Me</p><button data-action="color"></button></article>
<button data-action="theme">Outside</button>`
    expect(checkProject(html)).toEqual({ card: true, color: false, theme: false })
  })
})

describe('buildPreviewDoc', () => {
  const doc = buildPreviewDoc({ html: '<p>x</p>', css: 'p{}', js: 'console.log(1)</script><b>' }, 'run-7')

  it('blocks network access with a CSP', () => {
    expect(doc).toContain("connect-src 'none'")
    expect(doc).toContain("default-src 'none'")
  })

  it('embeds the run token and cannot be broken out of by user script', () => {
    expect(doc).toContain('"run-7"')
    expect(doc).toContain('<\\/script><b>')
  })
})

describe('isPreviewMessage', () => {
  it('only trusts the current run', () => {
    expect(isPreviewMessage({ source: 'lesuccess-cb', token: 'a' }, 'a')).toBe(true)
    expect(isPreviewMessage({ source: 'lesuccess-cb', token: 'old' }, 'a')).toBe(false)
    expect(isPreviewMessage({ source: 'other', token: 'a' }, 'a')).toBe(false)
    expect(isPreviewMessage(null, 'a')).toBe(false)
  })
})

describe('highlight', () => {
  it('escapes markup so highlighted code is inert', () => {
    const out = highlight('<img src=x onerror="alert(1)">', 'html')
    expect(out).not.toContain('<img')
    expect(out).toContain('&lt;')
  })

  it('tags tokens per language', () => {
    expect(highlight('const a = 1;', 'js')).toContain('cb-t-kw')
    expect(highlight('.card { color: #fff; }', 'css')).toContain('cb-t-sel')
  })
})
