// js/doors.js
import { computeRevealDelay, clampUnit, computeTiltTransform, computeGlareOffset } from './doors-pure.js';

const reduceMotion = document.documentElement.getAttribute('data-reduce-motion') === 'true'
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const doorItems = document.querySelectorAll('.door-item');

if (reduceMotion) {
  doorItems.forEach((d) => d.classList.add('revealed'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.dataset.idx);
        setTimeout(() => entry.target.classList.add('revealed'), computeRevealDelay(idx, 130));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  doorItems.forEach((d) => io.observe(d));
}

function toggleOpen(d) {
  d.classList.toggle('open');
}

doorItems.forEach((d) => {
  d.addEventListener('click', () => toggleOpen(d));
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen(d);
    }
  });
});

if (!reduceMotion) {
  doorItems.forEach((d) => {
    const mini = d.querySelector('.mini-door');
    d.addEventListener('mousemove', (e) => {
      const r = d.getBoundingClientRect();
      const dx = clampUnit(((e.clientX - r.left) / r.width - 0.5) * 2);
      const dy = clampUnit(((e.clientY - r.top) / r.height - 0.5) * 2);
      d.style.transform = computeTiltTransform(dx, dy, 4);
      const { gx, gy } = computeGlareOffset(dx, dy, 20);
      mini.style.setProperty('--gx', String(gx));
      mini.style.setProperty('--gy', String(gy));
    });
    d.addEventListener('mouseleave', () => {
      d.style.transform = '';
      mini.style.setProperty('--gx', '0');
      mini.style.setProperty('--gy', '0');
    });
  });
}
