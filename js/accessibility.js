// js/accessibility.js
import { readPreferences, writePreferences, nextTextSize, textSizeClass } from './accessibility-pure.js';

const storage = window.localStorage;
const btn = document.getElementById('a11yBtn');
const panel = document.getElementById('a11yPanel');
const contrastBox = document.getElementById('a11yContrast');
const motionBox = document.getElementById('a11yMotion');
const dyslexiaBox = document.getElementById('a11yDyslexia');

let prefs = readPreferences(storage);

function applyPrefs() {
  document.documentElement.classList.remove('a11y-text-sm', 'a11y-text-md', 'a11y-text-lg');
  document.documentElement.classList.add(textSizeClass(prefs.textSize));
  document.body.classList.toggle('a11y-high-contrast', prefs.highContrast);
  document.body.classList.toggle('a11y-dyslexia-font', prefs.dyslexiaFont);
  document.documentElement.setAttribute('data-reduce-motion', prefs.reduceMotion ? 'true' : 'false');
  contrastBox.checked = prefs.highContrast;
  motionBox.checked = prefs.reduceMotion;
  dyslexiaBox.checked = prefs.dyslexiaFont;
}

function savePrefs() {
  writePreferences(storage, prefs);
}

applyPrefs();

btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  panel.hidden = open;
});

document.addEventListener('click', (e) => {
  if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }
});

document.querySelectorAll('[data-a11y-textsize]').forEach((el) => {
  el.addEventListener('click', () => {
    const dir = el.dataset.a11yTextsize === 'up' ? 1 : -1;
    prefs = { ...prefs, textSize: nextTextSize(prefs.textSize, dir) };
    applyPrefs();
    savePrefs();
  });
});

contrastBox.addEventListener('change', () => {
  prefs = { ...prefs, highContrast: contrastBox.checked };
  applyPrefs();
  savePrefs();
});
motionBox.addEventListener('change', () => {
  prefs = { ...prefs, reduceMotion: motionBox.checked };
  applyPrefs();
  savePrefs();
});
dyslexiaBox.addEventListener('change', () => {
  prefs = { ...prefs, dyslexiaFont: dyslexiaBox.checked };
  applyPrefs();
  savePrefs();
});
