export function computeClipPathCircle(radiusCss, cxPx, cyPx) {
  return `circle(${radiusCss} at ${cxPx}px ${cyPx}px)`;
}

export function computeSwoopTimings({ openDelayMs = 200, expandMs = 560, holdMs = 60, fadeMs = 520 } = {}) {
  const scrollAt = openDelayMs + expandMs;
  const fadeAt = scrollAt + holdMs;
  const resetAt = fadeAt + fadeMs;
  return { openDelayMs, scrollAt, fadeAt, resetAt };
}
