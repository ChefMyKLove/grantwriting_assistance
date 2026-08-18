// api/admin/leads.js
import { sql } from '../../lib/db.js';
import { requireAdmin } from '../../lib/require-admin.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const leadsResult = await sql`SELECT * FROM leads ORDER BY submitted_at DESC`;
    const casesResult = await sql`SELECT * FROM cases`;

    const casesByLead = new Map();
    for (const c of casesResult.rows) {
      const list = casesByLead.get(c.lead_id) || [];
      list.push(c);
      casesByLead.set(c.lead_id, list);
    }

    const leads = leadsResult.rows.map((lead) => ({
      ...lead,
      cases: casesByLead.get(lead.id) || []
    }));

    res.status(200).json(leads);
  } catch (err) {
    console.error('Failed to fetch leads:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
