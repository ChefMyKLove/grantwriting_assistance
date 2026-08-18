// lib/require-admin.js
import { verifySessionToken } from './auth-pure.js';

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export function requireAdmin(req, res) {
  const token = parseCookie(req.headers.cookie, 'admin_session');
  if (!verifySessionToken(process.env.SESSION_SECRET, token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
