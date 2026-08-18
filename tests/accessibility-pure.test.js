import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextTextSize, textSizeClass, readPreferences, writePreferences } from '../js/accessibility-pure.js';

test('nextTextSize steps through sm -> md -> lg and clamps at the ends', () => {
  assert.equal(nextTextSize('sm', 1), 'md');
  assert.equal(nextTextSize('md', 1), 'lg');
  assert.equal(nextTextSize('lg', 1), 'lg');
  assert.equal(nextTextSize('md', -1), 'sm');
  assert.equal(nextTextSize('sm', -1), 'sm');
});

test('textSizeClass maps size to a CSS class, defaulting to md for unknown input', () => {
  assert.equal(textSizeClass('lg'), 'a11y-text-lg');
  assert.equal(textSizeClass('bogus'), 'a11y-text-md');
});

class FakeStorage {
  constructor(){ this.data = new Map(); }
  getItem(k){ return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k, v){ this.data.set(k, v); }
}

test('readPreferences returns defaults when nothing is stored', () => {
  const prefs = readPreferences(new FakeStorage());
  assert.deepEqual(prefs, { textSize: 'md', highContrast: false, reduceMotion: false, dyslexiaFont: false });
});

test('writePreferences then readPreferences round-trips', () => {
  const storage = new FakeStorage();
  writePreferences(storage, { textSize: 'lg', highContrast: true, reduceMotion: false, dyslexiaFont: true });
  assert.deepEqual(readPreferences(storage), { textSize: 'lg', highContrast: true, reduceMotion: false, dyslexiaFont: true });
});

test('readPreferences falls back to defaults on corrupted JSON', () => {
  const storage = new FakeStorage();
  storage.setItem('a11y-prefs', 'not json');
  assert.deepEqual(readPreferences(storage), { textSize: 'md', highContrast: false, reduceMotion: false, dyslexiaFont: false });
});
