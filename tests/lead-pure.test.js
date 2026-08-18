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
