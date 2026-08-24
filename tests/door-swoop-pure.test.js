import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  easeOutCubic,
  SMOLDER_PULSE,
  makeEmberParticle,
  makeEmberParticles,
  computeParticlePosition,
  computeParticleAlpha,
  computeParticleHue,
  computeRingRadius,
  computeRingAlpha,
  computeRingSpinRadians,
  computeCoverGradient,
  computeSwoopTimings
} from '../js/door-swoop-pure.js';

test('easeOutCubic maps 0 to 0 and 1 to 1, and rises in between', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  const mid = easeOutCubic(0.5);
  assert.ok(mid > 0 && mid < 1);
});

test('makeEmberParticle spreads particles evenly by index/count before jitter', () => {
  const rng = () => 0; // zeroes out every random() call - no jitter
  const p = makeEmberParticle(rng, 2, 8, SMOLDER_PULSE);
  assert.equal(p.angle, (2 / 8) * Math.PI * 2);
  assert.equal(p.lagMs, SMOLDER_PULSE.lagMinMs);
  assert.equal(p.size, SMOLDER_PULSE.sizeMin);
  assert.equal(p.radialOffset, -SMOLDER_PULSE.radialJitter / 2);
});

test('makeEmberParticles produces the requested count', () => {
  const particles = makeEmberParticles(Math.random, 12, SMOLDER_PULSE);
  assert.equal(particles.length, 12);
});

test('computeParticlePosition starts a particle at the origin', () => {
  const particle = { angle: 0, lagMs: 0, radialOffset: 0, tangentialPhase: 0, tangentialAmp: 0 };
  const pos = computeParticlePosition(particle, 0, 1000, 500, 0);
  assert.equal(pos.x, 0);
  assert.equal(pos.y, 0);
  assert.equal(pos.t, 0);
});

test('computeParticlePosition reaches (roughly) full radius once elapsed time meets the duration', () => {
  const particle = { angle: 0, lagMs: 0, radialOffset: 0, tangentialPhase: 0, tangentialAmp: 0 };
  const pos = computeParticlePosition(particle, 1000, 1000, 500, 0);
  assert.ok(Math.abs(pos.x - 500) < 0.001);
  assert.equal(pos.t, 1);
});

test('computeParticlePosition holds a particle at the origin until its own lag has elapsed', () => {
  const particle = { angle: 0, lagMs: 300, radialOffset: 0, tangentialPhase: 0, tangentialAmp: 0 };
  const pos = computeParticlePosition(particle, 200, 1000, 500, 0);
  assert.equal(pos.t, 0);
});

test('computeParticlePosition applies an upward rise as t grows', () => {
  const particle = { angle: Math.PI / 2, lagMs: 0, radialOffset: 0, tangentialPhase: 0, tangentialAmp: 0 };
  const pos = computeParticlePosition(particle, 1000, 1000, 0, -20);
  assert.equal(pos.y, -20);
});

test('computeParticleAlpha starts at 0 and fades back down by the end', () => {
  assert.equal(computeParticleAlpha(0, 0, 0), 0);
  const mid = computeParticleAlpha(0.5, 0, 0);
  assert.ok(mid > 0);
  const end = computeParticleAlpha(1, 0, 0);
  assert.ok(end < 0.05);
});

test('computeParticleHue spreads by angle and rotates over time, wrapped to [0,360)', () => {
  const h0 = computeParticleHue(0, 0);
  assert.equal(h0, 0);
  const h90 = computeParticleHue(Math.PI / 2, 0);
  assert.equal(h90, 90);
  const wrapped = computeParticleHue(0, 100000);
  assert.ok(wrapped >= 0 && wrapped < 360);
  const negative = computeParticleHue(-Math.PI / 2, 0);
  assert.ok(negative >= 0 && negative < 360);
});

test('computeRingRadius grows from 0 to maxRadius', () => {
  assert.equal(computeRingRadius(500, 0), 0);
  assert.equal(computeRingRadius(500, 1), 500);
});

test('computeRingAlpha peaks mid-travel and fades out by the end', () => {
  assert.equal(computeRingAlpha(0, 0.1), 0);
  const end = computeRingAlpha(1, 0.1);
  assert.ok(end < 0.02);
});

test('computeRingSpinRadians grows monotonically with elapsed time', () => {
  assert.equal(computeRingSpinRadians(0), 0);
  assert.ok(computeRingSpinRadians(600) > computeRingSpinRadians(300));
});

test('computeCoverGradient anchors at the given point and scales every stop by peak alpha', () => {
  const css = computeCoverGradient(120, 80, 0.5);
  assert.ok(css.startsWith('radial-gradient(circle at 120px 80px,'));
  assert.ok(css.includes('55%'));
  assert.ok(css.includes('100%'));

  const fullPeak = computeCoverGradient(0, 0, 1);
  const halfPeak = computeCoverGradient(0, 0, 0.5);
  const fullAlpha = Number(fullPeak.match(/--cream-rgb\),([\d.]+)\)/)[1]);
  const halfAlpha = Number(halfPeak.match(/--cream-rgb\),([\d.]+)\)/)[1]);
  assert.ok(halfAlpha < fullAlpha);
});

test('computeSwoopTimings derives navigate/fade/reset offsets from duration', () => {
  const t = computeSwoopTimings({ durationMs: 1300 });
  assert.equal(t.durationMs, 1300);
  assert.equal(t.navigateAt, 1420);
  assert.equal(t.fadeAt, 1820);
  assert.equal(t.resetAt, 2350);
});

test('computeSwoopTimings has sensible defaults with no args', () => {
  const t = computeSwoopTimings();
  assert.equal(t.durationMs, SMOLDER_PULSE.durationMs);
  assert.ok(t.navigateAt > 0 && t.fadeAt > t.navigateAt && t.resetAt > t.fadeAt);
});
