export function validateLeadPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('name is required');
  }
  if (!body.email || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('a valid email is required');
  }
  if (body.project_description !== undefined && typeof body.project_description !== 'string') {
    errors.push('project_description must be a string');
  }
  if (body.grant_type !== undefined && typeof body.grant_type !== 'string') {
    errors.push('grant_type must be a string');
  }
  return { valid: errors.length === 0, errors };
}

export function defaultCaseForLead(leadId) {
  return {
    lead_id: leadId,
    grant_name: null,
    hour_cap_tier: null,
    hours_used: 0,
    case_number: null,
    deadline: null,
    submission_status: 'pending'
  };
}
