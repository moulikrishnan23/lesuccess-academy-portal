/*
 * Challenge Builder: everything that is not React. Missions, playground
 * presets, the sandboxed preview document, the mission checks, the syntax
 * highlighter, saved progress and usage events. Kept here so it can be unit
 * tested (challenges.test.js) and so the component only deals with UI state.
 */

export const STORAGE_KEY = 'lesuccess_challenge_builder_v1'
export const STATS_KEY = 'lesuccess_challenge_stats_v1'
export const MESSAGE_SOURCE = 'lesuccess-cb'

/* ── Starter project and missions ─────────────────────────────────────── */

export const STARTER_FILES = {
  html: `<article data-card>
  <h2>My first project</h2>
  <!-- Add a paragraph below -->
</article>`,
  css: `/* Style your card here. Try a new accent: */
article[data-card] h2 {
  letter-spacing: -0.01em;
}`,
  js: `// Runs inside the preview.
// Try: console.log('Hello from my card!');`,
}

/**
 * The three missions. `needs` lists the checks (see checkProject) that must
 * pass; `action` is a button the visitor must also click in the preview.
 */
export const MISSIONS = [
  {
    id: 'card',
    title: 'Build your card',
    detail: 'Add a <p> introduction inside your card.',
    snippet: '  <p>Built by me, with LeSuccess.</p>',
    needs: ['card'],
    action: null,
  },
  {
    id: 'color',
    title: 'Make it change colour',
    detail: 'Add a button with data-action="color". Run, then click it.',
    snippet: '  <button data-action="color">Switch colour</button>',
    needs: ['card', 'color'],
    action: 'color',
  },
  {
    id: 'theme',
    title: 'Add a dark mode',
    detail: 'Add a button with data-action="theme". Try it in the preview.',
    snippet: '  <button data-action="theme">Light / dark</button>',
    needs: ['card', 'color', 'theme'],
    action: 'theme',
  },
]

/* ── Playground presets (course themed) ───────────────────────────────── */

export const PRESETS = [
  {
    id: 'hello',
    name: 'Hello card',
    course: null,
    files: {
      html: `<article data-card>
  <h2>Hello LeSuccess! 👋</h2>
  <p>Start learning HTML, CSS and JavaScript today.</p>
  <button onclick="alert('Welcome to LeSuccess Academy! 🚀')">Click me</button>
</article>`,
      css: `article[data-card] {
  text-align: center;
}`,
      js: `console.log('Card ready. Click the button!');`,
    },
  },
  {
    id: 'python',
    name: 'Python course card',
    course: { name: 'Python Full Stack', slug: 'python-full-stack-development' },
    files: {
      html: `<article data-card>
  <h2>Python Full Stack 🐍</h2>
  <p>Build complete web apps, front to back.</p>
  <ul class="stack">
    <li>Django</li><li>REST APIs</li><li>React</li><li>MySQL</li>
  </ul>
  <button id="enrol">Count my skills</button>
</article>`,
      css: `.stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  margin: 0 0 14px;
  list-style: none;
}
.stack li {
  padding: 4px 10px;
  border-radius: 999px;
  background: #fdedef;
  color: #CA164B;
  font-size: 12px;
  font-weight: 600;
}`,
      js: `const skills = document.querySelectorAll('.stack li');
document.getElementById('enrol').addEventListener('click', () => {
  alert('You will learn ' + skills.length + ' core tools on this track!');
});`,
    },
  },
  {
    id: 'data',
    name: 'Data dashboard',
    course: { name: 'Data Analytics', slug: 'data-analytics' },
    files: {
      html: `<article data-card>
  <h2>Weekly sign-ups 📊</h2>
  <div class="bars" id="bars"></div>
  <p id="summary"></p>
</article>`,
      css: `.bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 90px;
  margin-bottom: 10px;
}
.bars span {
  flex: 1;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(#DF1E26, #CA164B);
}`,
      js: `const week = [12, 18, 9, 24, 30, 16, 21];
const bars = document.getElementById('bars');
const max = Math.max(...week);
week.forEach((value) => {
  const bar = document.createElement('span');
  bar.style.height = (value / max) * 100 + '%';
  bars.appendChild(bar);
});
const average = week.reduce((a, b) => a + b, 0) / week.length;
document.getElementById('summary').textContent =
  'Average: ' + average.toFixed(1) + ' sign-ups a day';
console.log('Busiest day:', max);`,
    },
  },
]

/* ── Mission checks ───────────────────────────────────────────────────── */

const hasText = (el) => Boolean(el?.textContent?.trim())

/**
 * What the visitor's HTML already contains. Parsed with DOMParser, which never
 * runs scripts, so checking untrusted HTML here is safe.
 *
 * @returns {{card: boolean, color: boolean, theme: boolean}}
 */
export function checkProject(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html')
  const card = doc.querySelector('[data-card]')
  return {
    card: hasText(card?.querySelector('h1, h2, h3')) && hasText(card?.querySelector('p')),
    color: hasText(card?.querySelector('button[data-action="color"]')),
    theme: hasText(card?.querySelector('button[data-action="theme"]')),
  }
}

/** True when every check a mission needs has passed. */
export function missionReady(mission, checks) {
  return Boolean(checks) && mission.needs.every((need) => checks[need])
}

/** Feedback for the current mission after a run. */
export function missionFeedback(mission, checks) {
  if (!checks.card) return 'Keep an <article data-card> with a heading and a paragraph inside it.'
  if (!missionReady(mission, checks)) {
    const missing = mission.needs.find((need) => !checks[need])
    return `Add the ${missing === 'theme' ? 'light / dark' : missing} button inside your card, then run again.`
  }
  if (!mission.action) return 'Card built! Your first project is on screen.'
  return `Now click your ${mission.action === 'theme' ? 'light / dark' : 'colour'} button in the preview.`
}

/** Adds a mission's hint snippet just before the card closes. */
export function insertSnippet(html, snippet) {
  return html.includes('</article>')
    ? html.replace('</article>', `${snippet}\n</article>`)
    : `${html}\n${snippet}`
}

/* ── Preview document ─────────────────────────────────────────────────── */

const BASE_CSS = `*{box-sizing:border-box}
html{--accent:#DF1E26;background:#f6f9fc;color:#07405C;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
body{margin:0;padding:18px;display:grid;place-items:center;transition:background .2s,color .2s}
[data-card]{width:100%;max-width:320px;padding:22px 20px;border-radius:20px;background:#fff;border-top:4px solid var(--accent);box-shadow:0 12px 28px rgba(7,64,92,.08);overflow-wrap:anywhere}
h1,h2,h3{margin:0 0 10px;line-height:1.2}h2{font-size:21px}
p{font-size:13px;line-height:1.55;margin:0 0 14px;opacity:.8}
button{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:9px 14px;margin:4px 4px 0 0;border:0;border-radius:10px;background:var(--accent);color:#fff;font:600 12px system-ui,sans-serif;cursor:pointer}
button:focus-visible{outline:3px solid #f5a623;outline-offset:3px}
html[data-theme=dark]{background:#0b2a45;color:#f1f5f9}html[data-theme=dark] [data-card]{background:#07405C}
.__cb-toast{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);max-width:90%;padding:10px 14px;border-radius:12px;background:#0b2a45;color:#fff;font:600 12px system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:opacity .3s,transform .3s}
.__cb-toast.__out{opacity:0;transform:translate(-50%,8px)}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}`

/*
 * Runs before the visitor's code. It is the only channel back to the page:
 * forwards console output and errors, turns alert() into an in-preview toast
 * (the sandbox has no allow-modals, so a real alert would silently fail),
 * wires the data-action buttons, and reports the content height. Every message
 * carries the run's token so the page can ignore stale previews.
 */
function bridgeScript(token) {
  return `(function(){
var T=${JSON.stringify(token)};
function send(m){m.source=${JSON.stringify(MESSAGE_SOURCE)};m.token=T;try{parent.postMessage(m,'*')}catch(e){}}
function fmt(a){return Array.prototype.map.call(a,function(x){if(typeof x==='string')return x;try{return JSON.stringify(x)}catch(e){return String(x)}}).join(' ')}
['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){send({kind:'log',level:k==='info'?'log':k,text:fmt(arguments)});try{o.apply(console,arguments)}catch(e){}}});
window.addEventListener('error',function(e){send({kind:'log',level:'error',text:(e.message||'Error')+(e.lineno?' (line '+e.lineno+')':'')})});
function toast(m){var t=document.createElement('div');t.className='__cb-toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.classList.add('__out')},2200);setTimeout(function(){t.remove()},2600)}
window.alert=function(m){toast(String(m));send({kind:'log',level:'log',text:'alert: '+String(m)})};
var colors=['#DF1E26','#07405C','#1da75b','#f5a623'],ci=0;
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-action]');if(!b)return;var a=b.getAttribute('data-action'),d=document.documentElement;
if(a==='color'){ci=(ci+1)%colors.length;d.style.setProperty('--accent',colors[ci])}
else if(a==='theme'){d.setAttribute('data-theme',d.getAttribute('data-theme')==='dark'?'light':'dark')}
else return;send({kind:'action',action:a})});
function h(){send({kind:'height',height:Math.ceil(document.documentElement.scrollHeight)})}
window.addEventListener('load',function(){h();if(window.ResizeObserver)new ResizeObserver(h).observe(document.body)});
})();`
}

/**
 * The full preview document for one run. The CSP blocks every network request
 * and the iframe is sandboxed without allow-same-origin, so the visitor's code
 * runs in an opaque origin with no access to the site.
 */
export function buildPreviewDoc({ html = '', css = '', js = '' }, token) {
  const safeJs = String(js).replace(/<\/script/gi, '<\\/script')
  const safeCss = String(css).replace(/<\/style/gi, '<\\/style')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<style>${BASE_CSS}</style><style>${safeCss}</style>
<script>${bridgeScript(token)}</script></head>
<body>${html}<script>${safeJs}</script></body></html>`
}

/** Only messages from the current run's preview are trusted. */
export function isPreviewMessage(data, token) {
  return Boolean(data) && data.source === MESSAGE_SOURCE && data.token === token
}

/* ── Syntax highlighting ──────────────────────────────────────────────── */

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const RULES = {
  html: [
    [/<!--[\s\S]*?-->/, 'com'],
    [/"[^"]*"|'[^']*'/, 'str'],
    [/<\/?[a-zA-Z][\w-]*/, 'tag'],
    [/\/?>/, 'pun'],
    [/[a-zA-Z-]+(?=\s*=)/, 'att'],
  ],
  css: [
    [/\/\*[\s\S]*?\*\//, 'com'],
    [/"[^"]*"|'[^']*'/, 'str'],
    [/#[0-9a-fA-F]{3,8}\b/, 'num'],
    [/[a-zA-Z-]+(?=\s*:[^:])/, 'att'],
    [/[.#][a-zA-Z_][\w-]*/, 'sel'],
    [/-?\b\d+(?:\.\d+)?(?:px|%|rem|em|s|ms|deg|vh|vw)?\b/, 'num'],
    [/\b[a-z-]+(?=\()/, 'fn'],
    [/[{}:;]/, 'pun'],
  ],
  js: [
    [/\/\/[^\n]*|\/\*[\s\S]*?\*\//, 'com'],
    [/"[^"\n]*"|'[^'\n]*'|`[^`]*`/, 'str'],
    [/\b(?:const|let|var|function|return|if|else|for|while|of|in|new|true|false|null|undefined|=>)\b|=>/, 'kw'],
    [/\b\d+(?:\.\d+)?\b/, 'num'],
    [/\b[a-zA-Z_$][\w$]*(?=\()/, 'fn'],
    [/[{}()[\];,.]/, 'pun'],
  ],
}

const COMBINED = Object.fromEntries(
  Object.entries(RULES).map(([lang, rules]) => [
    lang,
    new RegExp(rules.map(([re]) => `(${re.source})`).join('|'), 'g'),
  ]),
)

/**
 * Highlights code as escaped HTML with `cb-t-*` token classes (coloured in
 * challenge-builder.css). Everything is escaped, so the result is safe to set
 * as innerHTML.
 */
export function highlight(code, lang = 'html') {
  const rules = RULES[lang] || RULES.html
  const re = new RegExp(COMBINED[lang] || COMBINED.html)
  let out = ''
  let last = 0
  for (let m = re.exec(code); m; m = re.exec(code)) {
    if (m[0] === '') {
      re.lastIndex += 1
      continue
    }
    out += escapeHtml(code.slice(last, m.index))
    const group = m.slice(1).findIndex((g) => g !== undefined)
    out += `<span class="cb-t-${rules[group][1]}">${escapeHtml(m[0])}</span>`
    last = m.index + m[0].length
  }
  return out + escapeHtml(code.slice(last))
}

/* ── Saved progress and usage events ──────────────────────────────────── */

export function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return saved && typeof saved === 'object' ? saved : null
  } catch {
    return null
  }
}

export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private mode or storage full: progress simply is not remembered.
  }
}

/**
 * Records a usage event: keeps running totals in localStorage and announces it
 * on window (`lesuccess:analytics`) and to window.dataLayer when an analytics
 * tag is installed, so it can be wired to GA/GTM without touching this file.
 */
export function trackBuilderEvent(name, detail = {}) {
  try {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
    stats[name] = (stats[name] || 0) + 1
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // Totals are a convenience; nothing depends on them.
  }
  const payload = { event: `challenge_builder_${name}`, ...detail }
  try {
    window.dataLayer?.push?.(payload)
    window.dispatchEvent(new CustomEvent('lesuccess:analytics', { detail: payload }))
  } catch {
    // Never let analytics break the editor.
  }
}
