const TEXT_SIZES = ['sm', 'md', 'lg'];
const DEFAULTS = { textSize: 'md', highContrast: false, reduceMotion: false, dyslexiaFont: false };

export function nextTextSize(current, direction) {
  const idx = TEXT_SIZES.indexOf(current);
  const safeIdx = idx === -1 ? 1 : idx;
  const nextIdx = Math.max(0, Math.min(TEXT_SIZES.length - 1, safeIdx + direction));
  return TEXT_SIZES[nextIdx];
}

export function textSizeClass(size) {
  return `a11y-text-${TEXT_SIZES.includes(size) ? size : 'md'}`;
}

export function readPreferences(storage) {
  try {
    const raw = storage.getItem('a11y-prefs');
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writePreferences(storage, prefs) {
  storage.setItem('a11y-prefs', JSON.stringify(prefs));
}
