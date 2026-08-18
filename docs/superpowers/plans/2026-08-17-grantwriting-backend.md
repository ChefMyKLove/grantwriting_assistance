# grants.chefmyklove Backend & Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the lead-capture API, lead/case data model, and a password-gated admin page for tracking leads and case hours/deadlines/status — no client login, admin-only, ready to feed a future accounting project without building accounting itself.

**Architecture:** Vercel serverless functions (Node, ES modules) under `api/`, a Postgres database via `@vercel/postgres`, and a single static `admin/index.html` + `admin/admin.js` page that talks to the admin API. Session auth is a stateless signed cookie (HMAC, no server-side session store needed) — appropriate for a single admin user, not a multi-user system.

**Tech Stack:** Node.js (Vercel serverless runtime), `@vercel/postgres`, Node's built-in `node:test` runner and `node:crypto`/`node:assert`.

**Spec:** `docs/superpowers/specs/2026-08-17-grantwriting-site-design.md`

## Global Constraints

- Database: **Vercel Postgres** (spec §9 names this or Turso as options; this plan commits to Postgres).
- Data model (spec §9): `leads` table (name, email, project description, submitted_at, status) and `cases` table (linked to a lead: grant/funding opportunity name, hour-cap tier, hours_used, **case_number** — required per spec §7 for Canada Council invoicing, deadline, submission_status).
- Admin access: single password-gated page, not a public route, no client login of any kind (spec §9).
- API contract for the public intake form (shared with the frontend plan — do not diverge): `POST /api/leads` with JSON body `{ name: string, email: string, grant_type?: string, project_description?: string }`. Success: `201 { id: number, status: "received" }`. Validation failure: `400 { error: string, errors: string[] }`.
- Accounting/invoicing features are explicitly out of scope (spec §10) — this plan only stores clean, structured data for that future work.
- This plan assumes `package.json` already exists with `"type": "module"` and a `test` script (created by the public-site plan's Task 1). If running this plan standalone, first run `npm init -y` and add `"type": "module"` to the generated `package.json` before starting Task 1.
- No Claude/AI references in any file, comment, or commit message. No `Co-Authored-By: Claude` trailer on any commit.

---

### Task 1: Backend scaffold — DB client, schema, env template

**Files:**
- Modify: `package.json` (add `@vercel/postgres` dependency and a `db:migrate` script)
- Create: `lib/db.js`
- Create: `schema.sql`
- Create: `.env.example`

**Interfaces:**
- Consumes: nothing
- Produces: `lib/db.js` exports `sql` (the `@vercel/postgres` tagged-template client) and `getPool()` re-export, consumed by every later API-route task; `schema.sql` defines the `leads` and `cases` tables every later task reads/writes.

- [ ] **Step 1: Add the dependency and migrate script to `package.json`**

Edit `package.json` to add (merge into existing `dependencies`/`scripts`, don't replace the whole file):

```json
{
  "dependencies": {
    "@vercel/postgres": "^0.10.0"
  },
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "db:migrate": "node --env-file=.env scripts/migrate.js"
  }
}
```

- [ ] **Step 2: Install the dependency**

Run: `npm install`
Expected: `node_modules/@vercel/postgres` exists, `package-lock.json` created/updated.

- [ ] **Step 3: Create `schema.sql`**

```sql
-- grants.chefmyklove backend schema

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_description TEXT,
  grant_type TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  grant_name TEXT,
  hour_cap_tier TEXT,
  hours_used NUMERIC NOT NULL DEFAULT 0,
  case_number TEXT,
  deadline DATE,
  submission_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 4: Create `lib/db.js`**

```js
// lib/db.js
import { sql } from '@vercel/postgres';

export { sql };
```

- [ ] **Step 5: Create `scripts/migrate.js`**

```js
// scripts/migrate.js
import { readFileSync } from 'node:fs';
import { sql } from '../lib/db.js';

const schema = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');

async function migrate() {
  const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

- [ ] **Step 6: Create `.env.example`**

```
# Copy to .env and fill in real values. Get POSTGRES_URL from the Vercel Postgres dashboard.
POSTGRES_URL=
ADMIN_PASSWORD=
SESSION_SECRET=
```

- [ ] **Step 7: Verify**

Run: `cat .env.example` (or open it) — confirm the three variable names are present and no real secrets are in the file. Do not run `npm run db:migrate` yet — that requires a real `POSTGRES_URL`, which is a manual setup step outside this plan (create the Vercel Postgres database in the Vercel dashboard, copy the connection string into a local `.env`).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json lib/db.js schema.sql scripts/migrate.js .env.example
git commit -m "Add backend scaffold: DB client, schema, migration script"
```

---

### Task 2: Pure helpers — lead validation and case defaults

**Files:**
- Create: `lib/lead-pure.js`
- Test: `tests/lead-pure.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `validateLeadPayload(body): { valid: boolean, errors: string[] }`, `defaultCaseForLead(leadId): object` — consumed by Task 4's `api/leads.js`.

- [ ] **Step 1: Write the failing test**

```js
// tests/lead-pure.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLeadPayload, defaultCaseForLead } from '../lib/lead-pure.js';

test('validateLeadPayload rejects a missing body', () => {
  const result = validateLeadPayload(null);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('validateLeadPayload rejects missing name and invalid email', () => {
  const result = validateLeadPayload({ name: '', email: 'not-an-email' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('name is required'));
  assert.ok(result.errors.includes('a valid email is required'));
});

test('validateLeadPayload accepts a minimal valid payload', () => {
  const result = validateLeadPayload({ name: 'Jane Doe', email: 'jane@example.com' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateLeadPayload rejects non-string optional fields', () => {
  const result = validateLeadPayload({ name: 'Jane', email: 'jane@example.com', project_description: 42 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('project_description must be a string'));
});

test('defaultCaseForLead builds a pending case row shape for a given lead id', () => {
  const c = defaultCaseForLead(7);
  assert.deepEqual(c, {
    lead_id: 7,
    grant_name: null,
    hour_cap_tier: null,
    hours_used: 0,
    case_number: null,
    deadline: null,
    submission_status: 'pending'
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../lib/lead-pure.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// lib/lead-pure.js
export function validateLeadPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('name is required');
  }
  if (!body.email || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('a valid email is required');
  }
  if (body.project_description !== undefined && typeof body.project_description !== 'string') {
    errors.push('project_description must be a string');
  }
  if (body.grant_type !== undefined && typeof body.grant_type !== 'string') {
    errors.push('grant_type must be a string');
  }
  return { valid: errors.length === 0, errors };
}

export function defaultCaseForLead(leadId) {
  return {
    lead_id: leadId,
    grant_name: null,
    hour_cap_tier: null,
    hours_used: 0,
    case_number: null,
    deadline: null,
    submission_status: 'pending'
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/lead-pure.js tests/lead-pure.test.js
git commit -m "Add lead validation and case-defaults pure helpers"
```

---

### Task 3: Pure helpers — admin auth (password check, session tokens)

**Files:**
- Create: `lib/auth-pure.js`
- Test: `tests/auth-pure.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `verifyPassword(candidate, expected): boolean`, `createSessionToken(secret, expiresAtMs): string`, `verifySessionToken(secret, token): boolean` — consumed by Task 5 (`api/admin/login.js`) and Task 6 (`lib/require-admin.js`).

- [ ] **Step 1: Write the failing test**

```js
// tests/auth-pure.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyPassword, createSessionToken, verifySessionToken } from '../lib/auth-pure.js';

test('verifyPassword accepts a matching password', () => {
  assert.equal(verifyPassword('correct-horse', 'correct-horse'), true);
});

test('verifyPassword rejects a mismatched password', () => {
  assert.equal(verifyPassword('wrong', 'correct-horse'), false);
});

test('verifyPassword rejects undefined/empty input without throwing', () => {
  assert.equal(verifyPassword(undefined, 'correct-horse'), false);
  assert.equal(verifyPassword('', 'correct-horse'), false);
});

test('createSessionToken + verifySessionToken round-trip for a future expiry', () => {
  const secret = 'test-secret';
  const expiresAtMs = Date.now() + 60_000;
  const token = createSessionToken(secret, expiresAtMs);
  assert.equal(verifySessionToken(secret, token), true);
});

test('verifySessionToken rejects an expired token', () => {
  const secret = 'test-secret';
  const expiresAtMs = Date.now() - 1000;
  const token = createSessionToken(secret, expiresAtMs);
  assert.equal(verifySessionToken(secret, token), false);
});

test('verifySessionToken rejects a token signed with a different secret', () => {
  const expiresAtMs = Date.now() + 60_000;
  const token = createSessionToken('secret-a', expiresAtMs);
  assert.equal(verifySessionToken('secret-b', token), false);
});

test('verifySessionToken rejects malformed tokens without throwing', () => {
  assert.equal(verifySessionToken('secret', ''), false);
  assert.equal(verifySessionToken('secret', 'not-a-token'), false);
  assert.equal(verifySessionToken('secret', undefined), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../lib/auth-pure.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// lib/auth-pure.js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyPassword(candidate, expected) {
  const a = Buffer.from(String(candidate ?? ''));
  const b = Buffer.from(String(expected ?? ''));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(secret, expiresAtMs) {
  const hmac = createHmac('sha256', secret).update(String(expiresAtMs)).digest('hex');
  return `${expiresAtMs}.${hmac}`;
}

export function verifySessionToken(secret, token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expiresAtStr, hmac] = token.split('.');
  const expiresAtMs = Number(expiresAtStr);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) return false;
  const expectedHmac = createHmac('sha256', secret).update(String(expiresAtMs)).digest('hex');
  const a = Buffer.from(hmac);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/auth-pure.js tests/auth-pure.test.js
git commit -m "Add admin auth pure helpers (password check, signed session tokens)"
```

---

### Task 4: `POST /api/leads` endpoint

**Files:**
- Create: `api/leads.js`

**Interfaces:**
- Consumes: `validateLeadPayload`, `defaultCaseForLead` (Task 2); `sql` from `lib/db.js` (Task 1)
- Produces: the live `/api/leads` endpoint the public-site plan's `js/intake-form.js` calls.

- [ ] **Step 1: Write `api/leads.js`**

```js
// api/leads.js
import { sql } from '../lib/db.js';
import { validateLeadPayload, defaultCaseForLead } from '../lib/lead-pure.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { valid, errors } = validateLeadPayload(req.body);
  if (!valid) {
    res.status(400).json({ error: 'Invalid submission', errors });
    return;
  }

  const { name, email, grant_type = null, project_description = null } = req.body;

  try {
    const leadResult = await sql`
      INSERT INTO leads (name, email, grant_type, project_description)
      VALUES (${name}, ${email}, ${grant_type}, ${project_description})
      RETURNING id
    `;
    const leadId = leadResult.rows[0].id;

    const defaultCase = defaultCaseForLead(leadId);
    await sql`
      INSERT INTO cases (lead_id, grant_name, hour_cap_tier, hours_used, case_number, deadline, submission_status)
      VALUES (${defaultCase.lead_id}, ${defaultCase.grant_name}, ${defaultCase.hour_cap_tier}, ${defaultCase.hours_used}, ${defaultCase.case_number}, ${defaultCase.deadline}, ${defaultCase.submission_status})
    `;

    res.status(201).json({ id: leadId, status: 'received' });
  } catch (err) {
    console.error('Failed to create lead:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again or email directly.' });
  }
}
```

- [ ] **Step 2: Verify with a local smoke test**

Run: `npx vercel dev` (requires a Vercel account linked via `vercel login` and a real `POSTGRES_URL` in `.env` — if that setup isn't done yet, skip this step for now and revisit once the Vercel project + database are provisioned; note that as a blocker in your final report rather than skipping silently).

Once `vercel dev` is running:
```bash
curl -s -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","project_description":"A test project"}'
```
Expected: `{"id":1,"status":"received"}` with HTTP 201. Then:
```bash
curl -s -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bad"}'
```
Expected: HTTP 400 with an `errors` array containing `"name is required"` and `"a valid email is required"`.

- [ ] **Step 3: Commit**

```bash
git add api/leads.js
git commit -m "Add POST /api/leads endpoint"
```

---

### Task 5: Admin login/logout endpoints

**Files:**
- Create: `api/admin/login.js`
- Create: `api/admin/logout.js`

**Interfaces:**
- Consumes: `verifyPassword`, `createSessionToken` from `lib/auth-pure.js` (Task 3); `process.env.ADMIN_PASSWORD`, `process.env.SESSION_SECRET`
- Produces: sets/clears the `admin_session` cookie that Task 6's `lib/require-admin.js` reads.

- [ ] **Step 1: Write `api/admin/login.js`**

```js
// api/admin/login.js
import { verifyPassword, createSessionToken } from '../../lib/auth-pure.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password } = req.body || {};
  if (!verifyPassword(password, process.env.ADMIN_PASSWORD)) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const expiresAtMs = Date.now() + SESSION_TTL_MS;
  const token = createSessionToken(process.env.SESSION_SECRET, expiresAtMs);

  res.setHeader('Set-Cookie', `admin_session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Strict`);
  res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Write `api/admin/logout.js`**

```js
// api/admin/logout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
  res.status(200).json({ ok: true });
}
```

- [ ] **Step 3: Verify with a local smoke test**

With `vercel dev` running and `ADMIN_PASSWORD`/`SESSION_SECRET` set in `.env`:
```bash
curl -si -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d '{"password":"wrong-password"}'
```
Expected: HTTP 401.
```bash
curl -si -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"password\":\"$ADMIN_PASSWORD\"}"
```
Expected: HTTP 200 with a `Set-Cookie: admin_session=...` header present.

- [ ] **Step 4: Commit**

```bash
git add api/admin/login.js api/admin/logout.js
git commit -m "Add admin login/logout endpoints"
```

---

### Task 6: Admin auth middleware helper

**Files:**
- Create: `lib/require-admin.js`

**Interfaces:**
- Consumes: `verifySessionToken` from `lib/auth-pure.js` (Task 3)
- Produces: `requireAdmin(req, res): boolean` — returns `true` and lets the caller proceed if authorized; returns `false` after already sending a 401 response if not, so callers can `if (!requireAdmin(req, res)) return;`. Consumed by Task 7 and Task 8.

- [ ] **Step 1: Write `lib/require-admin.js`**

```js
// lib/require-admin.js
import { verifySessionToken } from './auth-pure.js';

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export function requireAdmin(req, res) {
  const token = parseCookie(req.headers.cookie, 'admin_session');
  if (!verifySessionToken(process.env.SESSION_SECRET, token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
```

- [ ] **Step 2: Verify with a quick manual Node check**

Run:
```bash
node -e "
import('./lib/require-admin.js').then(({ requireAdmin }) => {
  const fakeRes = { statusCode: null, body: null, status(c){ this.statusCode = c; return this; }, json(b){ this.body = b; return this; } };
  const result = requireAdmin({ headers: {} }, fakeRes);
  console.log('no cookie ->', result, fakeRes.statusCode, JSON.stringify(fakeRes.body));
});
"
```
Expected output: `no cookie -> false 401 {"error":"Unauthorized"}`

- [ ] **Step 3: Commit**

```bash
git add lib/require-admin.js
git commit -m "Add requireAdmin auth middleware helper"
```

---

### Task 7: `GET /api/admin/leads` endpoint

**Files:**
- Create: `api/admin/leads.js`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6); `sql` from `lib/db.js` (Task 1)
- Produces: the leads+cases list the admin page (Task 9) renders.

- [ ] **Step 1: Write `api/admin/leads.js`**

```js
// api/admin/leads.js
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/require-admin.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const leadsResult = await sql`SELECT * FROM leads ORDER BY submitted_at DESC`;
    const casesResult = await sql`SELECT * FROM cases`;

    const casesByLead = new Map();
    for (const c of casesResult.rows) {
      const list = casesByLead.get(c.lead_id) || [];
      list.push(c);
      casesByLead.set(c.lead_id, list);
    }

    const leads = leadsResult.rows.map((lead) => ({
      ...lead,
      cases: casesByLead.get(lead.id) || []
    }));

    res.status(200).json(leads);
  } catch (err) {
    console.error('Failed to fetch leads:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
```

- [ ] **Step 2: Verify with a local smoke test**

With `vercel dev` running, first log in to get a session cookie, then use it:
```bash
curl -si -c cookies.txt -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"password\":\"$ADMIN_PASSWORD\"}"
curl -si -b cookies.txt http://localhost:3000/api/admin/leads
```
Expected: HTTP 200 with a JSON array (empty `[]` if no leads submitted yet, or containing entries with a `cases` array per lead if Task 4 was smoke-tested first). Then without the cookie:
```bash
curl -si http://localhost:3000/api/admin/leads
```
Expected: HTTP 401.

- [ ] **Step 3: Commit**

```bash
git add api/admin/leads.js
git commit -m "Add GET /api/admin/leads endpoint"
```

---

### Task 8: `PATCH /api/admin/cases/[id]` endpoint

**Files:**
- Create: `api/admin/cases/[id].js`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6); `sql` from `lib/db.js` (Task 1)
- Produces: the case-update endpoint the admin page (Task 9) calls.

- [ ] **Step 1: Write `api/admin/cases/[id].js`**

```js
// api/admin/cases/[id].js
import { sql } from '../../../lib/db.js';
import { requireAdmin } from '../../../lib/require-admin.js';

const EDITABLE_FIELDS = ['grant_name', 'hour_cap_tier', 'hours_used', 'case_number', 'deadline', 'submission_status'];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body && req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No editable fields provided' });
    return;
  }

  try {
    const result = await sql`
      UPDATE cases SET
        grant_name = COALESCE(${updates.grant_name ?? null}, grant_name),
        hour_cap_tier = COALESCE(${updates.hour_cap_tier ?? null}, hour_cap_tier),
        hours_used = COALESCE(${updates.hours_used ?? null}, hours_used),
        case_number = COALESCE(${updates.case_number ?? null}, case_number),
        deadline = COALESCE(${updates.deadline ?? null}, deadline),
        submission_status = COALESCE(${updates.submission_status ?? null}, submission_status),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update case:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
```

- [ ] **Step 2: Verify with a local smoke test**

Using the cookie jar from Task 7's verification and a real case `id` from a previously-created lead (check `/api/admin/leads` output for an id):
```bash
curl -si -b cookies.txt -X PATCH http://localhost:3000/api/admin/cases/1 \
  -H "Content-Type: application/json" \
  -d '{"case_number":"CC-12345","hours_used":2.5}'
```
Expected: HTTP 200 with the updated case row showing `case_number: "CC-12345"` and `hours_used: 2.5`. Then:
```bash
curl -si -b cookies.txt -X PATCH http://localhost:3000/api/admin/cases/99999 -H "Content-Type: application/json" -d '{"hours_used":1}'
```
Expected: HTTP 404.

- [ ] **Step 3: Commit**

```bash
git add "api/admin/cases/[id].js"
git commit -m "Add PATCH /api/admin/cases/[id] endpoint"
```

---

### Task 9: Admin page

**Files:**
- Create: `admin/index.html`
- Create: `admin/admin.js`
- Create: `admin/admin.css`

**Interfaces:**
- Consumes: `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/leads`, `PATCH /api/admin/cases/[id]` (Tasks 5, 7, 8)
- Produces: nothing consumed by other tasks — this is the last user-facing piece.

- [ ] **Step 1: Write `admin/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Admin — grants.chefmyklove</title>
<link rel="stylesheet" href="admin.css">
</head>
<body>

<div id="loginView">
  <form id="loginForm">
    <h1>Admin login</h1>
    <label for="loginPassword">Password</label>
    <input type="password" id="loginPassword" required>
    <button type="submit">Log in</button>
    <p id="loginError" hidden></p>
  </form>
</div>

<div id="dashboardView" hidden>
  <header>
    <h1>Leads &amp; cases</h1>
    <button id="logoutBtn" type="button">Log out</button>
  </header>
  <table id="leadsTable">
    <thead>
      <tr>
        <th>Name</th><th>Email</th><th>Grant type</th><th>Submitted</th><th>Case #</th>
        <th>Hours used</th><th>Deadline</th><th>Status</th><th></th>
      </tr>
    </thead>
    <tbody id="leadsBody"></tbody>
  </table>
</div>

<script type="module" src="admin.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `admin/admin.css`**

```css
:root{ --ink:#2B2620; --sub:#5c5245; --cream:#FAF3E7; --card:#F3E9D8; --terracotta:#C1663D; }
*{box-sizing:border-box;}
body{font-family:'Atkinson Hyperlegible', sans-serif; background:var(--cream); color:var(--ink); margin:0; padding:24px;}
#loginView{max-width:320px; margin:80px auto;}
#loginForm{display:flex; flex-direction:column; gap:10px;}
#loginForm input{padding:10px; font-size:15px;}
#loginForm button{padding:10px; background:var(--terracotta); color:#fff; border:none; cursor:pointer;}
#loginError{color:#a8391f; font-size:13px;}
header{display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;}
table{width:100%; border-collapse:collapse; font-size:13.5px;}
th, td{text-align:left; padding:8px 10px; border-bottom:1px solid rgba(43,38,32,0.15);}
input[type="text"], input[type="number"], input[type="date"]{width:100%; padding:6px; font-size:13px;}
```

- [ ] **Step 3: Write `admin/admin.js`**

```js
// admin/admin.js
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const leadsBody = document.getElementById('leadsBody');
const logoutBtn = document.getElementById('logoutBtn');

async function fetchLeads() {
  const res = await fetch('/api/admin/leads');
  if (res.status === 401) {
    showLogin();
    return;
  }
  const leads = await res.json();
  renderLeads(leads);
  showDashboard();
}

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
}

function renderLeads(leads) {
  leadsBody.innerHTML = '';
  for (const lead of leads) {
    const primaryCase = lead.cases[0] || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.grant_type || '')}</td>
      <td>${new Date(lead.submitted_at).toLocaleDateString()}</td>
      <td><input type="text" data-field="case_number" value="${escapeHtml(primaryCase.case_number || '')}"></td>
      <td><input type="number" step="0.5" data-field="hours_used" value="${primaryCase.hours_used ?? 0}"></td>
      <td><input type="date" data-field="deadline" value="${primaryCase.deadline ? primaryCase.deadline.slice(0, 10) : ''}"></td>
      <td>
        <select data-field="submission_status">
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="submitted">submitted</option>
          <option value="approved">approved</option>
        </select>
      </td>
      <td><button type="button" data-save="${primaryCase.id ?? ''}">Save</button></td>
    `;
    const select = tr.querySelector('select');
    select.value = primaryCase.submission_status || 'pending';
    leadsBody.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

leadsBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-save]');
  if (!btn) return;
  const caseId = btn.dataset.save;
  if (!caseId) return;

  const row = btn.closest('tr');
  const payload = {};
  row.querySelectorAll('[data-field]').forEach((el) => {
    payload[el.dataset.field] = el.value;
  });

  const res = await fetch(`/api/admin/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.status === 401) {
    showLogin();
    return;
  }

  btn.textContent = res.ok ? 'Saved' : 'Error';
  setTimeout(() => { btn.textContent = 'Save'; }, 1500);
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('loginPassword').value;
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (res.ok) {
    loginError.hidden = true;
    fetchLeads();
  } else {
    loginError.hidden = false;
    loginError.textContent = 'Invalid password';
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  showLogin();
});

fetchLeads();
```

- [ ] **Step 4: Verify in browser**

With `vercel dev` running, open `http://localhost:3000/admin/`. Confirm: login form shows first. Enter the wrong password — see "Invalid password." Enter the correct `ADMIN_PASSWORD` — dashboard loads showing any leads submitted during earlier smoke tests, one row per lead with editable case_number/hours_used/deadline/status fields. Edit a field and click Save — button briefly shows "Saved." Reload the page — the dashboard loads directly (no login prompt) because the session cookie is still valid; click Log out, reload — login form shows again. Confirm `<meta name="robots" content="noindex, nofollow">` is present (keeps this page out of search results).

- [ ] **Step 5: Commit**

```bash
git add admin/index.html admin/admin.css admin/admin.js
git commit -m "Add password-gated admin page for leads and case tracking"
```

---

### Task 10: Vercel config and end-to-end integration test

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Consumes: everything from Tasks 1–9
- Produces: nothing — final task in this plan.

- [ ] **Step 1: Write `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true
}
```

- [ ] **Step 2: Full end-to-end integration test**

This requires both this plan and the public-site plan to be complete, plus a real Vercel Postgres database provisioned with `POSTGRES_URL`/`ADMIN_PASSWORD`/`SESSION_SECRET` set in `.env`.

1. Run `npm run db:migrate` — confirm it prints "Migration complete." with no errors.
2. Run `npx vercel dev`.
3. Open `http://localhost:3000/` (the public site) and submit the intake form with real-looking test data. Confirm the on-page status message changes to "Thanks — I'll be in touch soon." (not the network-error fallback).
4. Open `http://localhost:3000/admin/`, log in, and confirm the lead you just submitted appears in the table with a default `pending` status and 0 hours used.
5. Edit that row's case number, hours used, and status, click Save, then reload the page — confirm the edits persisted.
6. Run the full frontend verification checklist from the public-site plan's Task 13 one more time against `http://localhost:3000/` (not `file://`) to confirm nothing broke when served through Vercel's dev server instead of opened directly.

Fix anything that fails before considering this plan complete.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "Add Vercel config; complete backend and admin integration"
```
