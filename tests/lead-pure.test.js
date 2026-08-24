import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLeadPayload, defaultCaseForLead, isSpamSubmission } from '../lib/lead-pure.js';

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

test('validateLeadPayload rejects a project_description over 5000 characters', () => {
  const result = validateLeadPayload({ name: 'Jane', email: 'jane@example.com', project_description: 'a'.repeat(5001) });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('project_description must be 5000 characters or fewer'));
});

test('validateLeadPayload accepts a project_description at exactly 5000 characters', () => {
  const result = validateLeadPayload({ name: 'Jane', email: 'jane@example.com', project_description: 'a'.repeat(5000) });
  assert.equal(result.valid, true);
});

test('validateLeadPayload rejects an overlong name', () => {
  const result = validateLeadPayload({ name: 'a'.repeat(201), email: 'jane@example.com' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('name must be 200 characters or fewer'));
});

test('validateLeadPayload rejects an overlong grant_type', () => {
  const result = validateLeadPayload({ name: 'Jane', email: 'jane@example.com', grant_type: 'a'.repeat(201) });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('grant_type must be 200 characters or fewer'));
});

test('validateLeadPayload rejects an overlong email', () => {
  const result = validateLeadPayload({ name: 'Jane', email: 'a'.repeat(250) + '@example.com' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('email must be 254 characters or fewer'));
});

test('isSpamSubmission flags a filled honeypot field', () => {
  const now = 1000000;
  assert.equal(isSpamSubmission({ _gotcha: 'buy now', _loadedAt: now - 5000 }, now), true);
});

test('isSpamSubmission flags a submission that arrived faster than the fill-time floor', () => {
  const now = 1000000;
  assert.equal(isSpamSubmission({ _gotcha: '', _loadedAt: now - 500 }, now), true);
});

test('isSpamSubmission flags a missing or invalid _loadedAt as spam', () => {
  const now = 1000000;
  assert.equal(isSpamSubmission({ _gotcha: '' }, now), true);
  assert.equal(isSpamSubmission({ _gotcha: '', _loadedAt: 'not-a-number' }, now), true);
});

test('isSpamSubmission accepts a normal, correctly-timed submission', () => {
  const now = 1000000;
  assert.equal(isSpamSubmission({ _gotcha: '', _loadedAt: now - 5000 }, now), false);
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
