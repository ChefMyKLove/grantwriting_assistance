// js/swoop-fx.js
// DOM/canvas wiring for the "Smolder Pulse" door-open effect, shared by
// hero-swoop.js (cross-page navigation) and doors-swoop.js (in-page
// doors->intake swoop) so both fire the identical effect. All the actual
// math lives in door-swoop-pure.js as plain, tested functions - this
// file only touches the DOM and the canvas 2D context.
import {
  SMOLDER_PULSE,
  makeEmberParticles,
  computeParticlePosition,
  computeParticleAlpha,
  computeParticleHue,
  computeRingRadius,
  computeRingAlpha,
  computeRingSpinRadians,
  computeCoverGradient,
  computeSwoopTimings
} from './door-swoop-pure.js';

// Canvas fillStyle/strokeStyle strings can't resolve CSS custom
// properties (var(--gold-rgb)) - that only works inside real CSS, which
// is why #door-flash's own background (computeCoverGradient) can use it
// but this canvas-only fallback stroke needs the literal value.
const GOLD_RGB_CANVAS = '224,158,90';
const RAINBOW_STOPS = ['#ff6b6b', '#ffd166', '#8ee06c', '#5ec8e6', '#7d8bf7', '#d68af0', '#ff6b6b'];

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// Fires the glow + ember swarm from originEl's on-screen position and
// returns the timings the caller needs to sequence navigate/fade/reset
// around it. Assumes the caller has already checked prefers-reduced-motion.
export function fireSmolderPulse(originEl) {
  const flash = document.getElementById('door-flash');
  const canvas = document.getElementById('swoop-particles');
  const ctx = resizeCanvas(canvas);
  const config = SMOLDER_PULSE;
  const timings = computeSwoopTimings({ durationMs: config.durationMs });

  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

  const particles = makeEmberParticles(Math.random, config.particleCount, config);

  // Glow: same gradient shape as the gold default, recolored via the
  // .rainbow hue-rotate() sweep in CSS rather than different stops.
  // Starts fading in at the same instant as the particles and over the
  // same duration, so both arrive as one motion.
  flash.classList.remove('page-enter-cover');
  flash.style.background = computeCoverGradient(cx, cy, config.coverPeakAlpha);
  flash.style.transition = 'none';
  flash.style.opacity = '0';
  // Clearing the property (not setting it to 'none') matters: 'none' sets
  // an inline animation-name that would permanently shadow the .rainbow
  // class's own animation-name, since inline styles beat class selectors
  // regardless of what's set afterward - removing it lets the class rule
  // take over once re-added below.
  flash.style.animation = '';
  void flash.offsetWidth; // force reflow so a repeat fire actually restarts the keyframes
  flash.style.animationDuration = config.durationMs + 'ms';
  flash.classList.add('rainbow');
  requestAnimationFrame(() => {
    flash.style.transition = `opacity ${(config.durationMs / 1000).toFixed(2)}s ease`;
    flash.style.opacity = '1';
  });

  let start = null;
  const totalMs = config.durationMs + 380; // particle tail after full radius

  function frame(ts) {
    if (start === null) start = ts;
    const elapsed = ts - start;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const t = Math.min(elapsed / config.durationMs, 1);

    if (t < 1) {
      const ringRadius = computeRingRadius(maxRadius, t);
      const ringAlpha = computeRingAlpha(t, config.ringPeakAlpha);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (typeof ctx.createConicGradient === 'function') {
        const spin = computeRingSpinRadians(elapsed);
        const conic = ctx.createConicGradient(spin, cx, cy);
        RAINBOW_STOPS.forEach((color, i) => conic.addColorStop(i / (RAINBOW_STOPS.length - 1), color));
        ctx.strokeStyle = conic;
        ctx.globalAlpha = ringAlpha * 2.2; // conic hues read fainter than a flat fill at equal alpha
      } else {
        ctx.strokeStyle = `rgba(${GOLD_RGB_CANVAS},${ringAlpha.toFixed(3)})`;
      }
      ctx.lineWidth = config.ringWidth;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, ringRadius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach((particle) => {
      const pos = computeParticlePosition(particle, elapsed, config.durationMs, maxRadius, config.riseFactor);
      const alpha = computeParticleAlpha(pos.t, elapsed, particle.flickerPhase);
      if (alpha <= 0.01) return;
      const px = cx + pos.x;
      const py = cy + pos.y;
      const hue = computeParticleHue(Math.atan2(pos.y, pos.x), elapsed);
      const radius = particle.size * 3;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, `hsla(${hue.toFixed(0)},85%,68%,${alpha.toFixed(3)})`);
      grad.addColorStop(0.45, `hsla(${hue.toFixed(0)},85%,60%,${(alpha * 0.45).toFixed(3)})`);
      grad.addColorStop(1, `hsla(${hue.toFixed(0)},85%,60%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    if (elapsed < totalMs) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }
  requestAnimationFrame(frame);

  return timings;
}
