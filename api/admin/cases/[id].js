// api/admin/cases/[id].js
import { sql } from '../../../lib/db.js';
import { requireAdmin } from '../../../lib/require-admin.js';

const EDITABLE_FIELDS = ['grant_name', 'hour_cap_tier', 'hours_used', 'case_number', 'deadline', 'submission_status'];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body && req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No editable fields provided' });
    return;
  }

  try {
    const result = await sql`
      UPDATE cases SET
        grant_name = COALESCE(${updates.grant_name ?? null}, grant_name),
        hour_cap_tier = COALESCE(${updates.hour_cap_tier ?? null}, hour_cap_tier),
        hours_used = COALESCE(${updates.hours_used ?? null}, hours_used),
        case_number = COALESCE(${updates.case_number ?? null}, case_number),
        deadline = COALESCE(${updates.deadline ?? null}, deadline),
        submission_status = COALESCE(${updates.submission_status ?? null}, submission_status),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update case:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
