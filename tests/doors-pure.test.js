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
