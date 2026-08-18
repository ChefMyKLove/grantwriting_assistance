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
