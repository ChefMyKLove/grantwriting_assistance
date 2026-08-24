export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Tuned recipe for the "Smolder Pulse" door-open effect: a swarm of
// embers riding the same expanding radius as the glow, arriving as one
// motion rather than two. Shared by both the hero->doors navigation and
// the in-page doors->intake swoop so they feel like the same effect.
export const SMOLDER_PULSE = {
  durationMs: 1300,
  particleCount: 60,
  lagMinMs: 0,
  lagMaxMs: 220,
  radialJitter: 46,
  tangentialDrift: 34,
  sizeMin: 2,
  sizeMax: 5,
  riseFactor: -10,
  coverPeakAlpha: 0.5,
  ringWidth: 26,
  ringPeakAlpha: 0.1
};

export function makeEmberParticle(rng, index, count, config) {
  return {
    angle: (index / count) * Math.PI * 2 + rng() * 0.12,
    lagMs: config.lagMinMs + rng() * (config.lagMaxMs - config.lagMinMs),
    radialOffset: (rng() - 0.5) * config.radialJitter,
    tangentialPhase: rng() * Math.PI * 2,
    tangentialAmp: rng() * config.tangentialDrift,
    size: config.sizeMin + rng() * (config.sizeMax - config.sizeMin),
    flickerPhase: rng() * Math.PI * 2
  };
}

export function makeEmberParticles(rng, count, config) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(makeEmberParticle(rng, i, count, config));
  }
  return particles;
}

// Each particle rides the same expanding radius as the ring/glow, offset
// by its own small lag/jitter/drift, so the swarm reads as one traveling
// wave instead of independently wandering near the origin.
export function computeParticlePosition(particle, elapsedMs, durationMs, maxRadius, riseFactor) {
  const particleElapsed = Math.max(0, elapsedMs - particle.lagMs);
  const t = Math.min(particleElapsed / durationMs, 1);
  const eased = easeOutCubic(t);
  const radius = Math.max(0, maxRadius * eased + particle.radialOffset * t);
  const tangential = Math.sin(t * Math.PI * 2 + particle.tangentialPhase) * particle.tangentialAmp * t;
  const angle = particle.angle + tangential / Math.max(radius, 1);
  const rise = riseFactor * t * t;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius + rise,
    t
  };
}

// Fades in fast, holds, fades out - reads as a flicker rather than a
// uniform dissolve - then a slow sine-driven shimmer on top of that.
export function computeParticleAlpha(t, elapsedMs, flickerPhase) {
  const lifeFade = t < 0.08 ? t / 0.08 : 1 - Math.pow((t - 0.08) / 0.92, 1.6);
  const flicker = 0.6 + 0.4 * Math.sin(elapsedMs / 70 + flickerPhase);
  return Math.max(0, Math.min(1, lifeFade)) * flicker;
}

// Hue spreads around the ring by angle (a full spectrum visible at any
// instant) and drifts by elapsed time (the whole spectrum slowly
// rotates through the swarm as it travels) - wrapped into [0,360).
export function computeParticleHue(angleRad, elapsedMs) {
  let hue = (angleRad * 180) / Math.PI + elapsedMs / 6;
  hue = hue % 360;
  if (hue < 0) hue += 360;
  return hue;
}

export function computeRingRadius(maxRadius, t) {
  return maxRadius * easeOutCubic(t);
}

export function computeRingAlpha(t, peakAlpha) {
  return Math.max(0, peakAlpha * Math.sin(Math.min(t * 1.6, 1) * Math.PI));
}

// Rotation (radians) for the ring's conic rainbow gradient, so the
// spectrum around the ring visibly spins rather than sitting fixed.
export function computeRingSpinRadians(elapsedMs) {
  return ((elapsedMs / 6) * Math.PI) / 180;
}

// Same shape as the site's #door-flash gradient (cream 0%, gold 55%,
// gold 100% - see --cream-rgb/--gold-rgb in css/styles.css), every
// stop's alpha scaled by peakAlpha so it settles instead of flashing.
// The rainbow recolor happens via a CSS hue-rotate() filter on the
// element using this background, not by changing these stops.
export function computeCoverGradient(cxPx, cyPx, peakAlpha) {
  const cream = peakAlpha.toFixed(2);
  const goldMid = (0.55 * peakAlpha).toFixed(2);
  const goldOuter = (0.92 * peakAlpha).toFixed(2);
  return (
    `radial-gradient(circle at ${cxPx}px ${cyPx}px, ` +
    `rgba(var(--cream-rgb),${cream}) 0%, ` +
    `rgba(var(--gold-rgb),${goldMid}) 55%, ` +
    `rgba(var(--gold-rgb),${goldOuter}) 100%)`
  );
}

export function computeSwoopTimings({ durationMs = SMOLDER_PULSE.durationMs } = {}) {
  const navigateAt = durationMs + 120;
  const fadeAt = durationMs + 520;
  const resetAt = durationMs + 1050;
  return { durationMs, navigateAt, fadeAt, resetAt };
}
