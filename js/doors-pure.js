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
