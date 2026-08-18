// js/door-swoop.js
import { computeClipPathCircle, computeSwoopTimings } from './door-swoop-pure.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroWrap = document.getElementById('heroDoorWrap');
const flash = document.getElementById('door-flash');
const timings = computeSwoopTimings();

function swoopTo(originEl, targetId, openHero) {
  const rect = originEl.getBoundingClientRect();
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);

  if (openHero) heroWrap.classList.add('open');

  flash.style.transition = 'none';
  flash.style.opacity = '1';
  flash.style.clipPath = computeClipPathCircle('0px', cx, cy);
  void flash.offsetWidth; // force reflow so the 0px reset paints before expanding

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
    if (openHero) heroWrap.classList.remove('open');
  }, timings.resetAt);
}

function triggerHeroSwoop() {
  if (reduceMotion) {
    const target = document.getElementById('doorsSection');
    if (target) target.scrollIntoView({ behavior: 'auto' });
    return;
  }
  swoopTo(document.getElementById('heroDoor'), 'doorsSection', true);
}

document.getElementById('ctaWipe').addEventListener('click', triggerHeroSwoop);
document.getElementById('heroDoor').addEventListener('click', triggerHeroSwoop);

const startAppBtn = document.getElementById('startAppBtn');
startAppBtn.addEventListener('click', () => {
  if (reduceMotion) {
    const target = document.getElementById('intake-section');
    if (target) target.scrollIntoView({ behavior: 'auto' });
    return;
  }
  swoopTo(startAppBtn, 'intake-section', false);
});
