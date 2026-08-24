// js/doors-swoop.js
// Two things: (1) this page's own entry reveal, continuing the hero
// page's cross-page swoosh (see js/hero-swoop.js) by fading away the
// flash it loads already covered by; (2) the in-page doors -> intake
// swoop, unchanged from before the hero/doors split.
import { computeClipPathCircle, computeSwoopTimings } from './door-swoop-pure.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const flash = document.getElementById('door-flash');
const timings = computeSwoopTimings();

// ---- Entry reveal ----
if (flash && flash.classList.contains('page-enter-cover')) {
  if (reduceMotion) {
    flash.style.transition = 'none';
    flash.style.opacity = '0';
  } else {
    requestAnimationFrame(() => {
      flash.style.transition = 'opacity 0.55s ease';
      flash.style.opacity = '0';
    });
  }
}

// ---- Doors -> intake swoop ----
function swoopTo(originEl, targetId) {
  const rect = originEl.getBoundingClientRect();
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);

  flash.style.transition = 'none';
  flash.style.opacity = '1';
  flash.style.clipPath = computeClipPathCircle('0px', cx, cy);
  void flash.offsetWidth;

  setTimeout(() => {
    flash.style.transition = 'clip-path 0.55s cubic-bezier(.6,0,.2,1)';
    flash.style.clipPath = computeClipPathCircle('150%', cx, cy);
  }, timings.openDelayMs);

  setTimeout(() => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'auto' });
  }, timings.scrollAt);

  setTimeout(() => {
    flash.style.transition = 'opacity 0.5s ease';
    flash.style.opacity = '0';
  }, timings.fadeAt);

  setTimeout(() => {
    flash.style.transition = 'none';
    flash.style.clipPath = computeClipPathCircle('0px', cx, cy);
  }, timings.resetAt);
}

const startAppBtn = document.getElementById('startAppBtn');
startAppBtn.addEventListener('click', () => {
  if (reduceMotion) {
    const target = document.getElementById('intake-section');
    if (target) target.scrollIntoView({ behavior: 'auto' });
    return;
  }
  swoopTo(startAppBtn, 'intake-section');
});
