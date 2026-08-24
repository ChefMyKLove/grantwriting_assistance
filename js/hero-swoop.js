// js/hero-swoop.js
// Hero door open + Smolder Pulse swoop, crossing a real page boundary:
// the door swings open, embers and a rainbow glow travel outward from
// it, then the browser navigates to doors.html - which loads already
// covered and fades the cover away (see js/doors-swoop.js), so the cut
// reads as one continuous swoosh across two page loads.
import { fireSmolderPulse } from './swoop-fx.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroWrap = document.getElementById('heroDoorWrap');

function navigateWithSwoop(originEl, destinationUrl) {
  heroWrap.classList.add('open');
  const timings = fireSmolderPulse(originEl);

  // Navigate once the glow/embers have visually arrived - no reveal/reset
  // here, since the page is about to unload; doors.html picks up the cover.
  setTimeout(() => {
    window.location.href = destinationUrl;
  }, timings.navigateAt);
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
