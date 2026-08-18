// api/admin/logout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
  res.status(200).json({ ok: true });
}
