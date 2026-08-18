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
