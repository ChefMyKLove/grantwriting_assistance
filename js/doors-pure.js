export function computeRevealDelay(index, staggerMs) {
  return index * staggerMs;
}

export function clampUnit(n) {
  return Math.max(-1, Math.min(1, n));
}

export function computeTiltTransform(dx, dy, maxTiltDeg) {
  const rx = (-dy * maxTiltDeg).toFixed(2);
  const ry = (dx * maxTiltDeg).toFixed(2);
  return `rotateX(${rx}deg) rotateY(${ry}deg)`;
}

export function computeGlareOffset(dx, dy, scale) {
  return { gx: Number((dx * scale).toFixed(1)), gy: Number((dy * scale).toFixed(1)) };
}

// Shown alongside the eligibility description when a door opens - a
// generic pool, not tied to any one category, so every door offers the
// same warmth regardless of which one someone happens to click.
export const INSPIRATION_MESSAGES = [
  'You are worthy of support.',
  'It’s okay to ask for help.',
  'Asking is a sign of strength.',
  'You don’t have to do this alone.',
  'You’ve already done the hardest part: showing up.',
  'This door was always meant for you.',
  'Your work deserves to be seen.',
  'There’s no wrong way to walk through this door.',
  'Support isn’t something you have to earn.',
  'Your story matters, however you tell it.',
  'One step at a time is still moving forward.',
  'You belong here.'
];

export function pickInspirationMessage(rng, messages = INSPIRATION_MESSAGES) {
  const index = Math.floor(rng() * messages.length);
  return messages[index];
}
