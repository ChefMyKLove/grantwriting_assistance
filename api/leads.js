// api/leads.js
import { db } from '@vercel/postgres';
import { validateLeadPayload, defaultCaseForLead } from '../lib/lead-pure.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { valid, errors } = validateLeadPayload(req.body);
  if (!valid) {
    res.status(400).json({ error: 'Invalid submission', errors });
    return;
  }

  const { name, email, grant_type = null, project_description = null } = req.body;

  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    const leadResult = await client.sql`
      INSERT INTO leads (name, email, grant_type, project_description)
      VALUES (${name}, ${email}, ${grant_type}, ${project_description})
      RETURNING id
    `;
    const leadId = leadResult.rows[0].id;

    const defaultCase = defaultCaseForLead(leadId);
    await client.sql`
      INSERT INTO cases (lead_id, grant_name, hour_cap_tier, hours_used, case_number, deadline, submission_status)
      VALUES (${defaultCase.lead_id}, ${defaultCase.grant_name}, ${defaultCase.hour_cap_tier}, ${defaultCase.hours_used}, ${defaultCase.case_number}, ${defaultCase.deadline}, ${defaultCase.submission_status})
    `;

    await client.sql`COMMIT`;
    res.status(201).json({ id: leadId, status: 'received' });
  } catch (err) {
    await client.sql`ROLLBACK`;
    console.error('Failed to create lead:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again or email directly.' });
  } finally {
    client.release();
  }
}
