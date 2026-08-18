// api/admin/login.js
import { verifyPassword, createSessionToken } from '../../lib/auth-pure.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password } = req.body || {};
  if (!verifyPassword(password, process.env.ADMIN_PASSWORD)) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const expiresAtMs = Date.now() + SESSION_TTL_MS;
  const token = createSessionToken(process.env.SESSION_SECRET, expiresAtMs);

  res.setHeader('Set-Cookie', `admin_session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Strict`);
  res.status(200).json({ ok: true });
}
