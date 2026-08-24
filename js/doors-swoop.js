// js/doors-swoop.js
// Two things: (1) this page's own entry reveal, continuing the hero
// page's cross-page swoosh (see js/hero-swoop.js) by fading away the
// cover it loads already covered by; (2) the in-page doors -> intake
// swoop, using the same Smolder Pulse effect as the hero door.
import { fireSmolderPulse } from './swoop-fx.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const flash = document.getElementById('door-flash');

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
  const timings = fireSmolderPulse(originEl);

  setTimeout(() => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'auto' });
  }, timings.navigateAt);

  setTimeout(() => {
    flash.style.transition = 'opacity 0.5s ease';
    flash.style.opacity = '0';
  }, timings.fadeAt);

  setTimeout(() => {
    flash.style.transition = 'none';
    flash.style.opacity = '0';
    flash.classList.remove('rainbow');
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
