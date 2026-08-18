# grants.chefmyklove Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public grants.chefmyklove marketing site — hero, eligibility doors, how-it-works, services, why-me, and intake form — in the "Open Door" visual direction, with the accessibility toolbar and the two interaction tiers (scroll-reveal/hinge-open doors, camera-swoop CTA transitions).

**Architecture:** Hand-written HTML/CSS/JS, zero framework, zero build step. One `index.html` for markup/content, one shared `css/styles.css`, and small ES modules under `js/` — each interactive feature split into a DOM-wiring file and a sibling `*-pure.js` file of framework-free pure functions, so the pure logic is unit-testable with Node's built-in test runner without a browser or DOM.

**Tech Stack:** Plain HTML5, CSS3 (custom properties, `clip-path`, CSS 3D transforms), vanilla ES modules, Node's built-in `node:test` runner for pure-function unit tests. Google Fonts: Fraunces, Atkinson Hyperlegible.

**Spec:** `docs/superpowers/specs/2026-08-17-grantwriting-site-design.md`

## Global Constraints

- Palette: Cream `#FAF3E7`, Card `#F3E9D8`, Ink `#2B2620`, Sub `#5c5245`, Terracotta `#C1663D`, Moss `#6B7A5E`, gold glow `rgba(224,158,90,0.55)` — exact values from spec §4.
- Typography: Fraunces (display headlines only) + Atkinson Hyperlegible (everything else). No Work Sans, no IBM Plex Mono/Sans anywhere in this build.
- Doorway arch shape always uses proportional `border-radius` (percentage + slash syntax), never a fixed pixel radius — spec §4.
- Every animation/transition must have a `prefers-reduced-motion: reduce` fallback that preserves the content, only removing motion — spec §5.
- Eligibility content is exactly 4 doors (Deaf/hard of hearing, Disability, Mental illness, First Nations/Inuit/Métis) — never 5, never a pictorial icon per door (numeral + tint only) — spec §6, §7.
- "How it works" content must match the real 3-step process from spec §7 (Self-ID → per-grant Log a Case, 3–5 business days, case number issued → optional third-party access with its real limits), not the simplified 4-step version from the original draft.
- API contract for the intake form (shared with the backend plan — do not diverge): `POST /api/leads` with JSON body `{ name: string, email: string, grant_type?: string, project_description?: string }`. Success: `201 { id: number, status: "received" }`. Validation failure: `400 { error: string, errors: string[] }`.
- No Claude/AI references in any file, comment, or commit message. No `Co-Authored-By: Claude` trailer on any commit.

---

### Task 1: Project scaffold — package.json, test runner, base CSS

**Files:**
- Create: `package.json`
- Create: `css/styles.css`
- Create: `index.html`
- Create: `tests/.gitkeep`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: root CSS custom properties (`--cream`, `--card`, `--ink`, `--sub`, `--terracotta`, `--moss`, `--gold-glow`) that every later CSS task relies on; `npm test` running `node --test tests/**/*.test.js`; `index.html` skeleton with `<head>` (fonts, stylesheet link) and empty `<body>` sections later tasks fill in.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "grants-chefmyklove",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/**/*.test.js"
  }
}
```

- [ ] **Step 2: Verify the test script runs with zero tests (sanity check before real tests exist)**

Run: `npm test`
Expected: exits 0 (no test files matched yet is fine — this just proves the script and Node's test runner are wired correctly). If Node reports "no test files found," that's an acceptable pass for this step; if it errors on `type: module` or the script itself, fix `package.json` before continuing.

- [ ] **Step 3: Create `css/styles.css` with reset, palette, and typography**

```css
/* grants.chefmyklove - base styles */
:root{
  --cream:#FAF3E7;
  --card:#F3E9D8;
  --ink:#2B2620;
  --sub:#5c5245;
  --terracotta:#C1663D;
  --moss:#6B7A5E;
  --gold-glow: rgba(224,158,90,0.55);
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  background:var(--cream);
  color:var(--ink);
  font-family:'Atkinson Hyperlegible', sans-serif;
  line-height:1.55;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;}
.wrap{max-width:1000px;margin:0 auto;padding:0 40px;}
h1, h2, h3{font-family:'Fraunces', serif; font-weight:500;}
.eyebrow{font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--terracotta);}
.skip-link{
  position:absolute; left:-9999px; top:auto;
  background:var(--ink); color:var(--cream); padding:10px 16px; z-index:100;
}
.skip-link:focus{ left:16px; top:16px; }
:focus-visible{ outline:3px solid var(--terracotta); outline-offset:2px; }

@media (max-width:700px){
  .wrap{ padding:0 20px; }
}

@media (prefers-reduced-motion: reduce){
  html{ scroll-behavior:auto; }
  *{ animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; }
}
```

- [ ] **Step 4: Create `index.html` skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Grant Application Assistance — grants.chefmyklove</title>
<meta name="description" content="Canada Council for the Arts will pay someone to help you finish your grant application. Self-identify — no diagnosis required.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>

<!-- NAV_PLACEHOLDER: Task 5 fills this in -->

<main id="main">
  <!-- HERO_PLACEHOLDER: Task 6 -->
  <!-- DOORS_PLACEHOLDER: Task 7 -->
  <!-- HOW_IT_WORKS_PLACEHOLDER: Task 9 -->
  <!-- SERVICES_PLACEHOLDER: Task 10 -->
  <!-- WHY_ME_PLACEHOLDER: Task 11 -->
  <!-- INTAKE_PLACEHOLDER: Task 12 -->
</main>

<!-- FOOTER_PLACEHOLDER: Task 13 -->

</body>
</html>
```

- [ ] **Step 5: Verify in browser**

Open `index.html` directly in a browser (file://). Confirm: page loads with cream background, no console errors, "Skip to content" link is invisible until you Tab to it (keyboard-focus it to confirm it appears top-left).

- [ ] **Step 6: Commit**

```bash
git add package.json css/styles.css index.html tests/.gitkeep
git commit -m "Scaffold project: package.json, base CSS, index.html skeleton"
```

---

### Task 2: Pure helpers — door-swoop timing/clip-path math

**Files:**
- Create: `js/door-swoop-pure.js`
- Test: `tests/door-swoop-pure.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `computeClipPathCircle(radiusCss, cxPx, cyPx): string`, `computeSwoopTimings(config?): { openDelayMs, scrollAt, fadeAt, resetAt }` — consumed by Task 8's `js/door-swoop.js`.

- [ ] **Step 1: Write the failing test**

```js
// tests/door-swoop-pure.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeClipPathCircle, computeSwoopTimings } from '../js/door-swoop-pure.js';

test('computeClipPathCircle formats a circle() clip-path anchored at given px coordinates', () => {
  assert.equal(computeClipPathCircle('150%', 400, 300), 'circle(150% at 400px 300px)');
  assert.equal(computeClipPathCircle('0px', 10, 20), 'circle(0px at 10px 20px)');
});

test('computeSwoopTimings derives sequential offsets from stage durations', () => {
  const t = computeSwoopTimings({ openDelayMs: 200, expandMs: 560, holdMs: 60, fadeMs: 520 });
  assert.equal(t.openDelayMs, 200);
  assert.equal(t.scrollAt, 760);   // 200 + 560
  assert.equal(t.fadeAt, 820);     // 760 + 60
  assert.equal(t.resetAt, 1340);   // 820 + 520
});

test('computeSwoopTimings has sensible defaults with no args', () => {
  const t = computeSwoopTimings();
  assert.ok(t.scrollAt > t.openDelayMs);
  assert.ok(t.fadeAt > t.scrollAt);
  assert.ok(t.resetAt > t.fadeAt);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/door-swoop-pure.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// js/door-swoop-pure.js
export function computeClipPathCircle(radiusCss, cxPx, cyPx) {
  return `circle(${radiusCss} at ${cxPx}px ${cyPx}px)`;
}

export function computeSwoopTimings({ openDelayMs = 200, expandMs = 560, holdMs = 60, fadeMs = 520 } = {}) {
  const scrollAt = openDelayMs + expandMs;
  const fadeAt = scrollAt + holdMs;
  const resetAt = fadeAt + fadeMs;
  return { openDelayMs, scrollAt, fadeAt, resetAt };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add js/door-swoop-pure.js tests/door-swoop-pure.test.js
git commit -m "Add door-swoop timing/clip-path pure helpers"
```

---

### Task 3: Pure helpers — door tilt/glare/reveal math

**Files:**
- Create: `js/doors-pure.js`
- Test: `tests/doors-pure.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `computeRevealDelay(index, staggerMs): number`, `clampUnit(n): number`, `computeTiltTransform(dx, dy, maxTiltDeg): string`, `computeGlareOffset(dx, dy, scale): {gx: number, gy: number}` — consumed by Task 7's `js/doors.js`.

- [ ] **Step 1: Write the failing test**

```js
// tests/doors-pure.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRevealDelay, clampUnit, computeTiltTransform, computeGlareOffset } from '../js/doors-pure.js';

test('computeRevealDelay staggers by index', () => {
  assert.equal(computeRevealDelay(0, 130), 0);
  assert.equal(computeRevealDelay(3, 130), 390);
});

test('clampUnit clamps to [-1, 1]', () => {
  assert.equal(clampUnit(2), 1);
  assert.equal(clampUnit(-2), -1);
  assert.equal(clampUnit(0.4), 0.4);
});

test('computeTiltTransform builds a rotateX/rotateY string, inverting Y', () => {
  const t = computeTiltTransform(1, 1, 4);
  assert.equal(t, 'rotateX(-4.00deg) rotateY(4.00deg)');
});

test('computeGlareOffset scales dx/dy and rounds to 1 decimal', () => {
  assert.deepEqual(computeGlareOffset(0.5, -0.5, 20), { gx: 10, gy: -10 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/doors-pure.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// js/doors-pure.js
export function computeRevealDelay(index, staggerMs) {
  return index * staggerMs;
}

export function clampUnit(n) {
  return Math.max(-1, Math.min(1, n));
}

export function computeTiltTransform(dx, dy, maxTiltDeg) {
  const rx = (-dy * maxTiltDeg).toFixed(2);
  const ry = (dx * maxTiltDeg).toFixed(2);
  return `rotateX(${rx}deg) rotateY(${ry}deg)`;
}

export function computeGlareOffset(dx, dy, scale) {
  return { gx: Number((dx * scale).toFixed(1)), gy: Number((dy * scale).toFixed(1)) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add js/doors-pure.js tests/doors-pure.test.js
git commit -m "Add door tilt/glare/reveal pure helpers"
```

---

### Task 4: Pure helpers — accessibility preferences

**Files:**
- Create: `js/accessibility-pure.js`
- Test: `tests/accessibility-pure.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `nextTextSize(current, direction): 'sm'|'md'|'lg'`, `textSizeClass(size): string`, `readPreferences(storage): {textSize, highContrast, reduceMotion, dyslexiaFont}`, `writePreferences(storage, prefs): void` — consumed by Task 5's `js/accessibility.js`. `storage` is any object with `getItem`/`setItem` (dependency-injected so this is testable without a browser).

- [ ] **Step 1: Write the failing test**

```js
// tests/accessibility-pure.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextTextSize, textSizeClass, readPreferences, writePreferences } from '../js/accessibility-pure.js';

test('nextTextSize steps through sm -> md -> lg and clamps at the ends', () => {
  assert.equal(nextTextSize('sm', 1), 'md');
  assert.equal(nextTextSize('md', 1), 'lg');
  assert.equal(nextTextSize('lg', 1), 'lg');
  assert.equal(nextTextSize('md', -1), 'sm');
  assert.equal(nextTextSize('sm', -1), 'sm');
});

test('textSizeClass maps size to a CSS class, defaulting to md for unknown input', () => {
  assert.equal(textSizeClass('lg'), 'a11y-text-lg');
  assert.equal(textSizeClass('bogus'), 'a11y-text-md');
});

class FakeStorage {
  constructor(){ this.data = new Map(); }
  getItem(k){ return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k, v){ this.data.set(k, v); }
}

test('readPreferences returns defaults when nothing is stored', () => {
  const prefs = readPreferences(new FakeStorage());
  assert.deepEqual(prefs, { textSize: 'md', highContrast: false, reduceMotion: false, dyslexiaFont: false });
});

test('writePreferences then readPreferences round-trips', () => {
  const storage = new FakeStorage();
  writePreferences(storage, { textSize: 'lg', highContrast: true, reduceMotion: false, dyslexiaFont: true });
  assert.deepEqual(readPreferences(storage), { textSize: 'lg', highContrast: true, reduceMotion: false, dyslexiaFont: true });
});

test('readPreferences falls back to defaults on corrupted JSON', () => {
  const storage = new FakeStorage();
  storage.setItem('a11y-prefs', 'not json');
  assert.deepEqual(readPreferences(storage), { textSize: 'md', highContrast: false, reduceMotion: false, dyslexiaFont: false });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/accessibility-pure.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// js/accessibility-pure.js
const TEXT_SIZES = ['sm', 'md', 'lg'];
const DEFAULTS = { textSize: 'md', highContrast: false, reduceMotion: false, dyslexiaFont: false };

export function nextTextSize(current, direction) {
  const idx = TEXT_SIZES.indexOf(current);
  const safeIdx = idx === -1 ? 1 : idx;
  const nextIdx = Math.max(0, Math.min(TEXT_SIZES.length - 1, safeIdx + direction));
  return TEXT_SIZES[nextIdx];
}

export function textSizeClass(size) {
  return `a11y-text-${TEXT_SIZES.includes(size) ? size : 'md'}`;
}

export function readPreferences(storage) {
  try {
    const raw = storage.getItem('a11y-prefs');
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writePreferences(storage, prefs) {
  storage.setItem('a11y-prefs', JSON.stringify(prefs));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add js/accessibility-pure.js tests/accessibility-pure.test.js
git commit -m "Add accessibility preferences pure helpers"
```

---

### Task 5: Nav + accessibility toolbar

**Files:**
- Modify: `index.html` (replace `<!-- NAV_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append nav + toolbar styles)
- Create: `js/accessibility.js`

**Interfaces:**
- Consumes: `readPreferences`, `writePreferences`, `nextTextSize`, `textSizeClass` from `js/accessibility-pure.js` (Task 4)
- Produces: `document.body` classes `a11y-text-sm|md|lg`, `a11y-high-contrast`, `a11y-dyslexia-font` that later CSS (this task) reacts to; `<html>`'s `data-reduce-motion` attribute other interaction scripts (Tasks 7, 8) check before animating.

- [ ] **Step 1: Replace the nav placeholder in `index.html`**

```html
<nav id="site-nav">
  <div class="wrap nav-inner">
    <div class="logo">grants.chefmyklove</div>
    <div class="nav-right">
      <button class="a11y-btn" id="a11yBtn" type="button" aria-expanded="false" aria-controls="a11yPanel">
        <span class="a11y-key" aria-hidden="true">&#128477;</span> Accessibility
      </button>
      <div class="a11y-panel" id="a11yPanel" hidden>
        <h2 class="a11y-panel-title">Accessibility</h2>
        <div class="a11y-row">
          <span>Text size</span>
          <div class="a11y-seg" role="group" aria-label="Text size">
            <button type="button" data-a11y-textsize="down" aria-label="Decrease text size">A&minus;</button>
            <button type="button" data-a11y-textsize="up" aria-label="Increase text size">A+</button>
          </div>
        </div>
        <div class="a11y-row">
          <label for="a11yContrast">High contrast</label>
          <input type="checkbox" id="a11yContrast">
        </div>
        <div class="a11y-row">
          <label for="a11yMotion">Reduce motion</label>
          <input type="checkbox" id="a11yMotion">
        </div>
        <div class="a11y-row">
          <label for="a11yDyslexia">Dyslexia-friendly font</label>
          <input type="checkbox" id="a11yDyslexia">
        </div>
      </div>
      <a class="nav-cta" href="#intake">Check eligibility</a>
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Append nav/toolbar CSS to `css/styles.css`**

```css
/* ---- Nav + accessibility toolbar ---- */
#site-nav{position:sticky;top:0;z-index:20;background:rgba(250,243,231,0.94);backdrop-filter:blur(6px);border-bottom:1px solid rgba(43,38,32,0.12);}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:68px;}
.logo{font-family:'Fraunces',serif;font-weight:600;font-size:18px;}
.nav-right{display:flex;align-items:center;gap:12px;position:relative;}
.nav-cta{font-weight:700;font-size:13.5px;background:var(--terracotta);color:#fff;padding:9px 16px;border-radius:20px;text-decoration:none;}
.a11y-btn{display:flex;align-items:center;gap:7px;background:var(--card);border:1.5px solid rgba(43,38,32,0.25);border-radius:20px;padding:8px 14px;font-weight:700;font-size:13px;color:var(--ink);cursor:pointer;font-family:inherit;}
.a11y-key{display:inline-block;transition:transform 0.35s cubic-bezier(.2,1.4,.4,1);}
.a11y-btn[aria-expanded="true"] .a11y-key{transform:rotate(50deg);}
.a11y-panel{position:absolute;top:calc(100% + 10px);right:120px;background:var(--cream);border:1.5px solid rgba(43,38,32,0.25);border-radius:14px;padding:16px;width:250px;box-shadow:0 12px 30px rgba(0,0,0,0.14);z-index:21;}
.a11y-panel[hidden]{display:none;}
.a11y-panel-title{font-family:'Atkinson Hyperlegible',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;color:var(--sub);}
.a11y-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(43,38,32,0.12);font-size:13.5px;font-weight:700;}
.a11y-row:last-child{border-bottom:none;}
.a11y-seg{display:flex;gap:4px;}
.a11y-seg button{border:1.5px solid var(--ink);background:var(--cream);border-radius:6px;padding:4px 8px;font-size:12px;font-family:inherit;cursor:pointer;}

/* States applied to <body> by js/accessibility.js */
body.a11y-text-sm{ font-size:15px; }
body.a11y-text-md{ font-size:17px; }
body.a11y-text-lg{ font-size:20px; }
body.a11y-high-contrast{ --cream:#FFFFFF; --card:#F0F0F0; --ink:#000000; --sub:#222222; --terracotta:#A8391F; }
body.a11y-dyslexia-font, body.a11y-dyslexia-font h1, body.a11y-dyslexia-font h2, body.a11y-dyslexia-font h3{
  font-family: 'Comic Sans MS', 'Atkinson Hyperlegible', sans-serif;
}
```

- [ ] **Step 3: Write `js/accessibility.js` (DOM wiring)**

```js
// js/accessibility.js
import { readPreferences, writePreferences, nextTextSize, textSizeClass } from './accessibility-pure.js';

const storage = window.localStorage;
const btn = document.getElementById('a11yBtn');
const panel = document.getElementById('a11yPanel');
const contrastBox = document.getElementById('a11yContrast');
const motionBox = document.getElementById('a11yMotion');
const dyslexiaBox = document.getElementById('a11yDyslexia');

let prefs = readPreferences(storage);

function applyPrefs() {
  document.body.classList.remove('a11y-text-sm', 'a11y-text-md', 'a11y-text-lg');
  document.body.classList.add(textSizeClass(prefs.textSize));
  document.body.classList.toggle('a11y-high-contrast', prefs.highContrast);
  document.body.classList.toggle('a11y-dyslexia-font', prefs.dyslexiaFont);
  document.documentElement.setAttribute('data-reduce-motion', prefs.reduceMotion ? 'true' : 'false');
  contrastBox.checked = prefs.highContrast;
  motionBox.checked = prefs.reduceMotion;
  dyslexiaBox.checked = prefs.dyslexiaFont;
}

function savePrefs() {
  writePreferences(storage, prefs);
}

applyPrefs();

btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  panel.hidden = open;
});

document.addEventListener('click', (e) => {
  if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }
});

document.querySelectorAll('[data-a11y-textsize]').forEach((el) => {
  el.addEventListener('click', () => {
    const dir = el.dataset.a11yTextsize === 'up' ? 1 : -1;
    prefs = { ...prefs, textSize: nextTextSize(prefs.textSize, dir) };
    applyPrefs();
    savePrefs();
  });
});

contrastBox.addEventListener('change', () => {
  prefs = { ...prefs, highContrast: contrastBox.checked };
  applyPrefs();
  savePrefs();
});
motionBox.addEventListener('change', () => {
  prefs = { ...prefs, reduceMotion: motionBox.checked };
  applyPrefs();
  savePrefs();
});
dyslexiaBox.addEventListener('change', () => {
  prefs = { ...prefs, dyslexiaFont: dyslexiaBox.checked };
  applyPrefs();
  savePrefs();
});
```

- [ ] **Step 4: Wire the script into `index.html`**

Add before `</body>`:
```html
<script type="module" src="js/accessibility.js"></script>
```

- [ ] **Step 5: Verify in browser**

Open `index.html`. Confirm: nav is sticky at top with logo left, Accessibility button + "Check eligibility" pill right. Click Accessibility — panel opens below the button, key emoji rotates. Click A+/A− a few times — body font size changes and persists across a page reload (check `localStorage.getItem('a11y-prefs')` in devtools console). Toggle "Reduce motion" — reload the page and confirm `<html data-reduce-motion="true">` is present. Tab through with keyboard only — button and all four controls must be reachable and show a visible focus ring.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/accessibility.js
git commit -m "Add nav and accessibility toolbar"
```

---

### Task 6: Hero section

**Files:**
- Modify: `index.html` (replace `<!-- HERO_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append hero + doorway-arch styles)

**Interfaces:**
- Consumes: `--terracotta`, `--moss`, `--gold-glow` CSS variables (Task 1)
- Produces: `#heroDoorWrap` / `#heroDoor` / `#ctaWipe` element IDs that Task 8's `js/door-swoop.js` attaches click handlers to.

- [ ] **Step 1: Replace the hero placeholder in `index.html`**

```html
<header class="hero-section">
  <div class="wrap hero">
    <div>
      <div class="eyebrow">Grant &amp; funding application help</div>
      <h1>There&rsquo;s a door in this paperwork</h1>
      <p class="hero-sub">Canada Council will pay someone to help you write, edit, and submit your grant application. I&rsquo;ll help you find the door in &mdash; and walk through it with you, line by line.</p>
      <div class="hero-ctas">
        <button class="btn-primary" id="ctaWipe" type="button">Find your way in</button>
        <a class="btn-secondary" href="#how-it-works">How it works</a>
      </div>
    </div>
    <div class="hero-door-wrap" id="heroDoorWrap">
      <div class="hero-door-light"></div>
      <div class="door-arch hero-door" id="heroDoor"></div>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Append hero + shared doorway-arch CSS to `css/styles.css`**

```css
/* ---- Doorway arch (shared base for hero + small doors) ---- */
.door-arch{position:relative;background:var(--moss);overflow:hidden;border-radius:50% 50% 6% 6% / 26% 26% 3% 3%;}
.door-arch::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 105%, var(--gold-glow), rgba(224,158,90,0) 65%);}
.door-arch::before{content:"";position:absolute;left:14%;top:22%;width:7%;height:5%;border-radius:50%;background:var(--cream);opacity:0.75;}

/* ---- Hero ---- */
.hero-section{padding:20px 0 10px;}
.hero{display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center;padding:60px 0;}
.hero h1{font-size:clamp(30px,4vw,44px);line-height:1.14;max-width:12ch;}
.hero-sub{margin-top:16px;font-size:17px;max-width:42ch;color:var(--sub);}
.hero-ctas{margin-top:26px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;}
.btn-primary{background:var(--terracotta);color:#fff;font-weight:700;font-size:15px;padding:14px 26px;border-radius:26px;text-decoration:none;display:inline-block;border:none;cursor:pointer;font-family:inherit;}
.btn-secondary{font-weight:700;font-size:15px;padding:14px 8px;text-decoration:none;color:var(--ink);border-bottom:2px solid var(--moss);}

.hero-door-wrap{width:200px;height:310px;margin:0 auto;position:relative;perspective:700px;}
.hero-door-light{position:absolute;inset:0;border-radius:50% 50% 6% 6% / 26% 26% 3% 3%;background:radial-gradient(circle at 50% 60%, var(--gold-glow) 0%, rgba(224,158,90,0) 75%);opacity:0;transition:opacity 0.4s ease 0.1s;}
.hero-door-wrap.open .hero-door-light{opacity:1;}
.hero-door{width:100%;height:100%;cursor:pointer;transform-origin:left center;transition:transform 0.6s cubic-bezier(.5,0,.3,1);}
.hero-door-wrap.open .hero-door{transform:rotateY(-100deg);}
.hero-door:hover{filter:brightness(1.05);}

@media (max-width:700px){
  .hero{grid-template-columns:1fr;text-align:center;}
  .hero h1{max-width:none;margin:0 auto;}
  .hero-sub{margin-left:auto;margin-right:auto;}
  .hero-ctas{justify-content:center;}
}

@media (prefers-reduced-motion: reduce){
  .hero-door, .hero-door-light{transition:none;}
}
```

- [ ] **Step 3: Verify in browser**

Open `index.html`. Confirm: hero renders with headline, subhead, two CTAs, and a green arch-shaped door graphic on the right (desktop width) or below the text (narrow width). No JS wiring yet — clicking the door/button does nothing until Task 8.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "Add hero section with doorway arch graphic"
```

---

### Task 7: Which door is yours (eligibility doors)

**Files:**
- Modify: `index.html` (replace `<!-- DOORS_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append doors section styles)
- Create: `js/doors.js`

**Interfaces:**
- Consumes: `computeRevealDelay`, `clampUnit`, `computeTiltTransform`, `computeGlareOffset` from `js/doors-pure.js` (Task 3); `.door-arch` base styles (Task 6)
- Produces: `#doorsSection` element ID that Task 8's swoop targets; `.door-item` DOM structure other tasks don't touch further.

- [ ] **Step 1: Replace the doors placeholder in `index.html`**

Exactly 4 doors, matching spec §7's real eligibility categories, with neurodivergence noted inside Disability and Mental illness (not a 5th door):

```html
<section class="wrap" id="doorsSection">
  <h2 class="section-title">Which door is yours</h2>
  <p class="section-intro">These are the Canada Council&rsquo;s own Self-ID categories &mdash; hover or tap a door to see who it covers.</p>
  <div class="doors-row" id="doorsRow">
    <div class="door-item" data-idx="0" tabindex="0">
      <span class="field-num">01</span>
      <div class="door-frame"><div class="door-light"></div><div class="door-arch mini-door"></div></div>
      <div class="label">Deaf / hard of hearing</div>
      <div class="desc">Full eligibility under the program&rsquo;s own terms.</div>
    </div>
    <div class="door-item" data-idx="1" tabindex="0">
      <span class="field-num">02</span>
      <div class="door-frame"><div class="door-light"></div><div class="door-arch mini-door"></div></div>
      <div class="label">Disability</div>
      <div class="desc">Physical, chronic, or otherwise &mdash; including neurodivergent conditions like ADHD. Self-identified, no proof required.</div>
    </div>
    <div class="door-item" data-idx="2" tabindex="0">
      <span class="field-num">03</span>
      <div class="door-frame"><div class="door-light"></div><div class="door-arch mini-door"></div></div>
      <div class="label">Mental illness</div>
      <div class="desc">Also covers neurodivergent conditions. Self-identified, no diagnosis documentation required.</div>
    </div>
    <div class="door-item" data-idx="3" tabindex="0">
      <span class="field-num">04</span>
      <div class="door-frame"><div class="door-light"></div><div class="door-arch mini-door"></div></div>
      <div class="label">First Nations, Inuit, M&eacute;tis</div>
      <div class="desc">Facing language, geographic, or cultural barriers to applying.</div>
    </div>
  </div>
  <div class="doors-cta-row">
    <button class="btn-primary" id="startAppBtn" type="button">Start your application &rarr;</button>
  </div>
</section>
```

- [ ] **Step 2: Append doors CSS to `css/styles.css`**

```css
/* ---- Which door is yours ---- */
.section-title{font-size:11px;font-weight:700;margin:0 0 8px;color:var(--sub);text-transform:uppercase;letter-spacing:0.08em;}
.section-intro{color:var(--sub);font-size:14px;margin-bottom:20px;max-width:52ch;}
.doors-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
.door-item{
  background:var(--card);border-radius:8px 8px 4px 4px;padding:20px 14px 16px;text-align:center;
  opacity:0;transform:translateY(28px);
  transition:opacity 0.6s ease, transform 0.6s ease;
  position:relative;cursor:pointer;
}
.door-item.revealed{opacity:1;transform:translateY(0);}
.door-item .field-num{position:absolute;top:10px;left:12px;font-size:10px;font-weight:700;color:var(--sub);opacity:0.6;}
.door-item:nth-child(1) .mini-door{background:linear-gradient(160deg, var(--moss), #7d8d6f);}
.door-item:nth-child(2) .mini-door{background:linear-gradient(160deg, var(--moss), #6f8d82);}
.door-item:nth-child(3) .mini-door{background:linear-gradient(160deg, var(--moss), #8d8368);}
.door-item:nth-child(4) .mini-door{background:linear-gradient(160deg, var(--moss), #7d7a8d);}

.door-frame{width:44px;height:64px;margin:0 auto 12px;position:relative;perspective:220px;}
.door-light{position:absolute;inset:0;border-radius:50% 50% 6% 6% / 26% 26% 3% 3%;background:radial-gradient(circle at 50% 60%, var(--gold-glow) 0%, rgba(224,158,90,0) 75%);opacity:0;transition:opacity 0.4s ease 0.15s;}
.door-item.open .door-light{opacity:1;}
.mini-door{width:100%;height:100%;transform-origin:left center;transform-style:preserve-3d;transition:transform 0.5s cubic-bezier(.5,0,.3,1);}
.door-item.open .mini-door{transform:rotateY(-110deg);}

.door-item .label{font-weight:700;font-size:13px;line-height:1.3;transition:opacity 0.2s ease;}
.door-item.open .label{opacity:0;}
.door-item .desc{
  position:absolute;left:14px;right:14px;top:84px;
  font-size:11.5px;line-height:1.4;color:var(--sub);
  opacity:0;transition:opacity 0.35s ease 0.3s;
}
.door-item.open .desc{opacity:1;}

.doors-cta-row{text-align:center;margin-top:8px;padding-bottom:20px;}

@media (max-width:700px){
  .doors-row{grid-template-columns:repeat(2,1fr);}
}

@media (prefers-reduced-motion: reduce){
  .door-item{transition:none;opacity:1;transform:none;}
  .mini-door{transition:none;}
}
```

- [ ] **Step 3: Write `js/doors.js` (DOM wiring)**

```js
// js/doors.js
import { computeRevealDelay, clampUnit, computeTiltTransform, computeGlareOffset } from './doors-pure.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const doorItems = document.querySelectorAll('.door-item');

if (reduceMotion) {
  doorItems.forEach((d) => d.classList.add('revealed'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.dataset.idx);
        setTimeout(() => entry.target.classList.add('revealed'), computeRevealDelay(idx, 130));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  doorItems.forEach((d) => io.observe(d));
}

function toggleOpen(d) {
  d.classList.toggle('open');
}

doorItems.forEach((d) => {
  d.addEventListener('click', () => toggleOpen(d));
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen(d);
    }
  });
});

if (!reduceMotion) {
  doorItems.forEach((d) => {
    const mini = d.querySelector('.mini-door');
    d.addEventListener('mousemove', (e) => {
      const r = d.getBoundingClientRect();
      const dx = clampUnit(((e.clientX - r.left) / r.width - 0.5) * 2);
      const dy = clampUnit(((e.clientY - r.top) / r.height - 0.5) * 2);
      d.style.transform = computeTiltTransform(dx, dy, 4);
      const { gx, gy } = computeGlareOffset(dx, dy, 20);
      mini.style.setProperty('--gx', String(gx));
      mini.style.setProperty('--gy', String(gy));
    });
    d.addEventListener('mouseleave', () => {
      d.style.transform = '';
      mini.style.setProperty('--gx', '0');
      mini.style.setProperty('--gy', '0');
    });
  });
}
```

- [ ] **Step 4: Wire the script into `index.html`**

Add before `</body>` (after the accessibility script):
```html
<script type="module" src="js/doors.js"></script>
```

- [ ] **Step 5: Verify in browser**

Open `index.html` and scroll to the doors section — the 4 cards should fade/rise into place staggered. Click a door — it swings open on its hinge, label fades, description fades in. Click again — it closes. Hover a door (desktop) — subtle tilt. In devtools, set `prefers-reduced-motion: reduce` (Rendering tab) and reload — doors should appear immediately with no animation, and clicking still opens/closes them (just instantly, no hinge motion — confirm no console errors).

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/doors.js
git commit -m "Add which-door-is-yours eligibility section with hinge-open interaction"
```

---

### Task 8: Door-swoop CTA transitions

**Files:**
- Modify: `index.html` (add flash overlay element)
- Modify: `css/styles.css` (append flash overlay styles)
- Create: `js/door-swoop.js`

**Interfaces:**
- Consumes: `computeClipPathCircle`, `computeSwoopTimings` from `js/door-swoop-pure.js` (Task 2); `#heroDoorWrap`/`#heroDoor`/`#ctaWipe` (Task 6); `#doorsSection`/`#startAppBtn` (Task 7); `#intake-section` (produced by Task 12 — this task's second swoop target must exist by the time this is manually verified, but the JS itself doesn't fail if the element is added later, since `scrollIntoView` is called at click-time, not load-time)
- Produces: nothing further consumed by other tasks — this is the final piece of the interaction layer.

- [ ] **Step 1: Add the flash overlay element to `index.html`**

Add just before `</body>` (after the last section, before the script tags):
```html
<div id="door-flash" aria-hidden="true"></div>
```

- [ ] **Step 2: Append flash overlay CSS to `css/styles.css`**

```css
/* ---- Camera-swoop flash: iris expands from the clicked door's own
   on-screen position (set via inline clip-path in JS) ---- */
#door-flash{
  position:fixed;inset:0;z-index:999;pointer-events:none;
  background:radial-gradient(circle, var(--cream) 0%, var(--gold-glow) 55%, rgba(224,158,90,0.92) 100%);
  clip-path:circle(0px at 50% 50%);
  opacity:1;
}
```

- [ ] **Step 3: Write `js/door-swoop.js`**

```js
// js/door-swoop.js
import { computeClipPathCircle, computeSwoopTimings } from './door-swoop-pure.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroWrap = document.getElementById('heroDoorWrap');
const flash = document.getElementById('door-flash');
const timings = computeSwoopTimings();

function swoopTo(originEl, targetId, openHero) {
  const rect = originEl.getBoundingClientRect();
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);

  if (openHero) heroWrap.classList.add('open');

  flash.style.transition = 'none';
  flash.style.opacity = '1';
  flash.style.clipPath = computeClipPathCircle('0px', cx, cy);
  void flash.offsetWidth; // force reflow so the 0px reset paints before expanding

  setTimeout(() => {
    flash.style.transition = 'clip-path 0.55s cubic-bezier(.6,0,.2,1)';
    flash.style.clipPath = computeClipPathCircle('150%', cx, cy);
  }, timings.openDelayMs);

  setTimeout(() => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'auto' });
  }, timings.scrollAt);

  setTimeout(() => {
    flash.style.transition = 'opacity 0.5s ease';
    flash.style.opacity = '0';
  }, timings.fadeAt);

  setTimeout(() => {
    flash.style.transition = 'none';
    flash.style.clipPath = computeClipPathCircle('0px', cx, cy);
    if (openHero) heroWrap.classList.remove('open');
  }, timings.resetAt);
}

function triggerHeroSwoop() {
  if (reduceMotion) {
    const target = document.getElementById('doorsSection');
    if (target) target.scrollIntoView({ behavior: 'auto' });
    return;
  }
  swoopTo(document.getElementById('heroDoor'), 'doorsSection', true);
}

document.getElementById('ctaWipe').addEventListener('click', triggerHeroSwoop);
document.getElementById('heroDoor').addEventListener('click', triggerHeroSwoop);

const startAppBtn = document.getElementById('startAppBtn');
startAppBtn.addEventListener('click', () => {
  if (reduceMotion) {
    const target = document.getElementById('intake-section');
    if (target) target.scrollIntoView({ behavior: 'auto' });
    return;
  }
  swoopTo(startAppBtn, 'intake-section', false);
});
```

- [ ] **Step 4: Wire the script into `index.html`**

Add before `</body>`, after `js/doors.js`:
```html
<script type="module" src="js/door-swoop.js"></script>
```

- [ ] **Step 5: Verify in browser**

Note: `#intake-section` doesn't exist until Task 12 — until then, clicking "Start your application" will play the flash but land wherever the page naturally scrolls (no error, `scrollIntoView` guard just no-ops if the target is missing since `target` is checked before calling). Click the hero door graphic — it should swing open, then a warm flash should expand from the door's exact position and land you on the doors section. Click "Find your way in" — same result. Click "Start your application" below the doors — same flash mechanic. With `prefers-reduced-motion: reduce` set in devtools, reload and click each trigger — should jump instantly with no flash or hinge animation.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/door-swoop.js
git commit -m "Add camera-swoop CTA transitions between hero, doors, and intake"
```

---

### Task 9: How it works section

**Files:**
- Modify: `index.html` (replace `<!-- HOW_IT_WORKS_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append steps styles)

**Interfaces:**
- Consumes: base typography/palette (Task 1)
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Replace the how-it-works placeholder in `index.html`**

Content matches the real 3-step process from spec §7 exactly (not the simplified 4-step draft version):

```html
<section class="wrap" id="how-it-works">
  <h2 class="section-title">How it works</h2>
  <div class="steps">
    <div class="step">
      <div class="step-num">01</div>
      <h3>Complete your Self-ID form</h3>
      <p>On your Canada Council portal, under My Account. Required for eligibility, completely private, and only you can fill it out &mdash; no third party, including me, can complete or modify it for you.</p>
    </div>
    <div class="step">
      <div class="step-num">02</div>
      <h3>Request Application Assistance, per grant</h3>
      <p>Through the portal&rsquo;s Help &rarr; Log a Case screen. I&rsquo;ll help you write the request. Canada Council reviews in 3&ndash;5 business days and, if approved, issues a case number &mdash; that&rsquo;s what lets me invoice them directly for that grant.</p>
    </div>
    <div class="step">
      <div class="step-num">03</div>
      <h3>Optionally, add me as third party</h3>
      <p>Only if you want me typing directly into the application with you. I can never see your Self-ID or Account Information, and you always submit the application yourself &mdash; that part can&rsquo;t be delegated.</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append steps CSS to `css/styles.css`**

```css
/* ---- How it works ---- */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(43,38,32,0.14);border-radius:8px;overflow:hidden;margin-top:18px;margin-bottom:40px;}
.step{background:var(--cream);padding:24px 22px;}
.step-num{font-family:'Fraunces',serif;font-size:22px;color:var(--terracotta);margin-bottom:8px;}
.step h3{font-size:16px;margin-bottom:8px;}
.step p{font-size:13.5px;color:var(--sub);line-height:1.5;}

@media (max-width:700px){
  .steps{grid-template-columns:1fr;}
}
```

- [ ] **Step 3: Verify in browser**

Open `index.html`, scroll to "How it works." Confirm the three steps render in a row (desktop) or stacked (mobile <700px), with accurate copy: Self-ID first, per-grant Log a Case with the 3–5 business day / case-number detail, then the optional third-party step with its stated limits.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "Add how-it-works section with accurate 3-step process"
```

---

### Task 10: Services & covered hours section

**Files:**
- Modify: `index.html` (replace `<!-- SERVICES_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append services table styles)

**Interfaces:**
- Consumes: base typography/palette (Task 1)
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Replace the services placeholder in `index.html`**

```html
<section class="wrap" id="services">
  <h2 class="section-title">What&rsquo;s covered</h2>
  <p class="section-intro">Inside these hour caps, Canada Council pays &mdash; not you.</p>
  <table class="services-table">
    <thead>
      <tr><th>Service</th><th>Covered hours</th></tr>
    </thead>
    <tbody>
      <tr><td>Account setup</td><td>up to 2 hrs</td></tr>
      <tr><td>Microgrants / travel grants</td><td>up to 7 hrs</td></tr>
      <tr><td>Project grants</td><td>up to 10 hrs</td></tr>
      <tr><td>Composite / long-term grants</td><td>up to 17 hrs</td></tr>
      <tr><td>Progress &amp; final reports</td><td>up to 5 hrs</td></tr>
      <tr><td>Grant acceptance paperwork</td><td>up to 2 hrs</td></tr>
    </tbody>
  </table>
  <div class="services-alt">
    <h3>Don&rsquo;t qualify for Canada Council funding?</h3>
    <p>I also write grant applications directly, on a sliding scale, for artists and organizations outside this program. <a href="mailto:chefmyklove@gmail.com">Email me</a> and tell me about your project.</p>
  </div>
</section>
```

- [ ] **Step 2: Append services table CSS to `css/styles.css`**

```css
/* ---- Services & covered hours ---- */
.services-table{width:100%;border-collapse:collapse;margin:20px 0 30px;font-size:14.5px;}
.services-table th, .services-table td{text-align:left;padding:12px 14px;border-bottom:1px solid rgba(43,38,32,0.14);}
.services-table th{font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:var(--sub);font-weight:700;}
.services-alt{background:var(--card);border-radius:12px;padding:22px;margin-bottom:40px;}
.services-alt h3{font-size:16px;margin-bottom:8px;}
.services-alt p{font-size:14px;color:var(--sub);}
.services-alt a{color:var(--terracotta);font-weight:700;}
```

- [ ] **Step 3: Verify in browser**

Open `index.html`, scroll to "What's covered." Confirm the 6-row table renders with correct hour caps, followed by the general-grant-writing fallback callout with a working `mailto:` link.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "Add services and covered-hours section"
```

---

### Task 11: Why me section

**Files:**
- Modify: `index.html` (replace `<!-- WHY_ME_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append why-me styles)

**Interfaces:**
- Consumes: base typography/palette (Task 1)
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Replace the why-me placeholder in `index.html`**

Per spec §8, this is the biggest trust gap in the original draft. This task writes honest, concrete copy grounded only in facts already established (that Michael has personally been through this exact application process, which is what made the accurate how-it-works copy in Task 9 possible) — no fabricated testimonials or unverifiable claims:

```html
<section class="wrap" id="why-me">
  <h2 class="section-title">Why me</h2>
  <p class="why-me-copy">I&rsquo;ve been through this process myself &mdash; the portal, the Self-ID form, the Log a Case screen, the wording that actually gets a request approved. I know what Canada Council&rsquo;s reviewers are looking for in that description field, and I know exactly what a third party can and can&rsquo;t do inside your account, because I&rsquo;ve worked within those limits directly. You&rsquo;re not the first application I&rsquo;ve helped move through this system.</p>
</section>
```

- [ ] **Step 2: Append why-me CSS to `css/styles.css`**

```css
/* ---- Why me ---- */
.why-me-copy{font-size:16px;line-height:1.7;color:var(--sub);max-width:62ch;margin-bottom:40px;}
```

- [ ] **Step 3: Verify in browser**

Open `index.html`, scroll to "Why me." Confirm the section renders with readable line length (not full page width) and no broken markup.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "Add why-me credibility section"
```

---

### Task 12: Start here (intake form)

**Files:**
- Modify: `index.html` (replace `<!-- INTAKE_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append intake form styles)
- Create: `js/intake-form.js`

**Interfaces:**
- Consumes: `POST /api/leads` contract from Global Constraints (implemented by the backend plan) — this task builds the real fetch call against that documented contract; it does not need the backend to exist to be written or to pass its own verification steps (verification uses a stubbed fetch failure path since no server is running yet), but full end-to-end submission only works once the backend plan's Task 4 is deployed.
- Produces: `#intake-section` element ID, consumed by Task 8's swoop target.

- [ ] **Step 1: Replace the intake placeholder in `index.html`**

```html
<section class="wrap" id="intake-section">
  <h2 class="section-title">Start here</h2>
  <p class="section-intro">Tell me a bit about your project and deadline. I&rsquo;ll follow up with next steps, including the Self-ID form and how to name me as your support person.</p>
  <form class="intake-box" id="intakeForm">
    <div class="intake-field">
      <label for="i-name">Name</label>
      <input type="text" id="i-name" name="name" required>
    </div>
    <div class="intake-field">
      <label for="i-email">Email</label>
      <input type="email" id="i-email" name="email" required>
    </div>
    <div class="intake-field">
      <label for="i-grant">Grant type / deadline (if known)</label>
      <input type="text" id="i-grant" name="grant_type" placeholder="e.g. Concept to Realization, Nov 2026">
    </div>
    <div class="intake-field">
      <label for="i-details">A bit about your project</label>
      <textarea id="i-details" name="project_description"></textarea>
    </div>
    <button class="btn-primary" type="submit">Send</button>
    <p class="intake-status" id="intakeStatus" role="status" aria-live="polite" hidden></p>
  </form>
</section>
```

- [ ] **Step 2: Append intake form CSS to `css/styles.css`**

```css
/* ---- Start here (intake form) ---- */
.intake-box{background:var(--card);border-radius:16px;padding:36px;max-width:560px;margin:20px auto 60px;}
.intake-field{margin-bottom:16px;text-align:left;}
.intake-field label{display:block;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:var(--sub);margin-bottom:6px;}
.intake-field input, .intake-field textarea{width:100%;font-family:inherit;font-size:15px;padding:11px 13px;border:1.5px solid rgba(43,38,32,0.25);border-radius:8px;background:var(--cream);color:var(--ink);}
.intake-field textarea{min-height:90px;resize:vertical;}
.intake-box button[type="submit"]{width:100%;margin-top:4px;}
.intake-status{margin-top:14px;font-size:13.5px;color:var(--sub);}
```

- [ ] **Step 3: Write `js/intake-form.js`**

```js
// js/intake-form.js
const form = document.getElementById('intakeForm');
const status = document.getElementById('intakeStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: form.name.value,
    email: form.email.value,
    grant_type: form.grant_type.value,
    project_description: form.project_description.value
  };

  status.hidden = false;
  status.textContent = 'Sending…';

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      status.textContent = "Thanks — I'll be in touch soon.";
      form.reset();
    } else {
      status.textContent = (data && data.error) || 'Something went wrong. Please try again or email me directly.';
    }
  } catch (err) {
    status.textContent = "Something didn't send — email chefmyklove@gmail.com directly and I'll get it.";
  }
});
```

- [ ] **Step 4: Wire the script into `index.html`**

Add before `</body>`, after `js/door-swoop.js`:
```html
<script type="module" src="js/intake-form.js"></script>
```

- [ ] **Step 5: Verify in browser**

Open `index.html`, scroll to "Start here." Fill the form and submit — since no backend is running yet, you should see the network-error fallback message ("Something didn't send…") rather than a page crash or unhandled promise rejection (check devtools console for errors — there should be a caught fetch failure, not an uncaught one). Confirm required-field browser validation blocks submission when Name or Email is empty.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/intake-form.js
git commit -m "Add intake form wired to the POST /api/leads contract"
```

---

### Task 13: Footer + full-page integration pass

**Files:**
- Modify: `index.html` (replace `<!-- FOOTER_PLACEHOLDER -->`)
- Modify: `css/styles.css` (append footer styles)

**Interfaces:**
- Consumes: everything from Tasks 1–12
- Produces: nothing — this is the final task in this plan.

- [ ] **Step 1: Replace the footer placeholder in `index.html`**

```html
<footer class="site-footer">
  <div class="wrap footer-inner">
    <span>grants.chefmyklove.com</span>
    <span>Independent Application Assistance provider &middot; not affiliated with Canada Council for the Arts</span>
    <a href="mailto:chefmyklove@gmail.com">chefmyklove@gmail.com</a>
  </div>
</footer>
```

- [ ] **Step 2: Append footer CSS to `css/styles.css`**

```css
/* ---- Footer ---- */
.site-footer{padding:40px 0;border-top:1px solid rgba(43,38,32,0.14);font-size:13px;color:var(--sub);}
.footer-inner{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;}
.footer-inner a{color:var(--terracotta);font-weight:700;}
```

- [ ] **Step 3: Full integration verification checklist**

Open `index.html` fresh and go through this list in order:
1. Page loads with no console errors.
2. Nav sticky, accessibility toolbar opens/closes, all four controls work and persist across reload.
3. Hero renders correctly at desktop (>700px) and mobile (<700px) widths (resize the window or use devtools device toolbar).
4. Clicking the hero door or "Find your way in" plays the swing + flash + lands on the doors section.
5. Each of the 4 doors reveals on scroll, opens/closes on click, and shows the correct description text (verify none say "ADHD" as if it were its own category — it must only appear inside Disability/Mental illness descriptions).
6. "Start your application" swoops from the doors section to the intake form.
7. How it works shows the accurate 3-step process (Self-ID → per-grant Log a Case with 3–5 business days/case number → optional third-party with its real limits).
8. Services table shows all 6 rows with correct hour caps; the general grant-writing fallback callout is present with a working mailto link.
9. Why me section renders.
10. Intake form submits (shows the network-error fallback message, since the backend isn't deployed by this plan).
11. Footer shows contact + non-affiliation disclaimer.
12. Set `prefers-reduced-motion: reduce` in devtools Rendering tab, reload, and repeat steps 4–6 — everything should jump instantly with zero animation, no missing content, no console errors.
13. Tab through the entire page keyboard-only from the skip link to the footer — every interactive element must be reachable and show a visible focus ring.
14. Zoom the browser to 200% (Ctrl/Cmd + several times) and check every section — text must stay readable and no content should be clipped or overlap; the doors grid and services table may reflow to fewer columns, which is fine, but nothing should require horizontal scrolling of the page body.

Fix anything that fails before proceeding.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "Add footer and complete public site"
```
