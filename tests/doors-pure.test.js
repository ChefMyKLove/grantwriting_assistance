import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRevealDelay, clampUnit, computeTiltTransform, computeGlareOffset, INSPIRATION_MESSAGES, pickInspirationMessage } from '../js/doors-pure.js';

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

test('INSPIRATION_MESSAGES has at least a dozen non-empty messages', () => {
  assert.ok(INSPIRATION_MESSAGES.length >= 12);
  INSPIRATION_MESSAGES.forEach((msg) => {
    assert.equal(typeof msg, 'string');
    assert.ok(msg.trim().length > 0);
  });
});

test('pickInspirationMessage picks by index using the injected rng, low end', () => {
  const messages = ['a', 'b', 'c', 'd'];
  const msg = pickInspirationMessage(() => 0, messages);
  assert.equal(msg, 'a');
});

test('pickInspirationMessage picks by index using the injected rng, high end', () => {
  const messages = ['a', 'b', 'c', 'd'];
  const msg = pickInspirationMessage(() => 0.999999, messages);
  assert.equal(msg, 'd');
});

test('pickInspirationMessage defaults to INSPIRATION_MESSAGES when no list is given', () => {
  const msg = pickInspirationMessage(() => 0);
  assert.equal(msg, INSPIRATION_MESSAGES[0]);
});
