import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyPassword(candidate, expected) {
  const a = Buffer.from(String(candidate ?? ''));
  const b = Buffer.from(String(expected ?? ''));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(secret, expiresAtMs) {
  const hmac = createHmac('sha256', secret).update(String(expiresAtMs)).digest('hex');
  return `${expiresAtMs}.${hmac}`;
}

export function verifySessionToken(secret, token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expiresAtStr, hmac] = token.split('.');
  const expiresAtMs = Number(expiresAtStr);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) return false;
  const expectedHmac = createHmac('sha256', secret).update(String(expiresAtMs)).digest('hex');
  const a = Buffer.from(hmac);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
