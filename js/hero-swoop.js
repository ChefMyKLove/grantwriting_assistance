// js/hero-swoop.js
// Hero door open + camera-swoop, now crossing a real page boundary:
// the door swings open, the flash expands to fully cover the screen,
// then the browser navigates to doors.html - which loads already
// covered by the same flash and fades it away (see js/doors-swoop.js),
// so the cut reads as one continuous swoosh across two page loads.
import { computeClipPathCircle, computeSwoopTimings } from './door-swoop-pure.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroWrap = document.getElementById('heroDoorWrap');
const flash = document.getElementById('door-flash');
const timings = computeSwoopTimings();

function navigateWithSwoop(originEl, destinationUrl) {
  const rect = originEl.getBoundingClientRect();
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);

  heroWrap.classList.add('open');

  flash.style.transition = 'none';
  flash.style.opacity = '1';
  flash.style.clipPath = computeClipPathCircle('0px', cx, cy);
  void flash.offsetWidth; // force reflow so the 0px reset paints before expanding

  setTimeout(() => {
    flash.style.transition = 'clip-path 0.55s cubic-bezier(.6,0,.2,1)';
    flash.style.clipPath = computeClipPathCircle('150%', cx, cy);
  }, timings.openDelayMs);

  // Navigate once the flash has fully covered the screen - no reveal/reset
  // here, since the page is about to unload; doors.html picks up the cover.
  setTimeout(() => {
    window.location.href = destinationUrl;
  }, timings.scrollAt);
}

function trigger() {
  if (reduceMotion) {
    window.location.href = 'doors.html';
    return;
  }
  navigateWithSwoop(document.getElementById('heroDoor'), 'doors.html');
}

document.getElementById('ctaWipe').addEventListener('click', trigger);
document.getElementById('heroDoor').addEventListener('click', trigger);
