const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254; // RFC 5321 max
const MAX_GRANT_TYPE_LENGTH = 200;
const MAX_PROJECT_DESCRIPTION_LENGTH = 5000;

export function validateLeadPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('name is required');
  } else if (body.name.length > MAX_NAME_LENGTH) {
    errors.push(`name must be ${MAX_NAME_LENGTH} characters or fewer`);
  }
  if (!body.email || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('a valid email is required');
  } else if (body.email.length > MAX_EMAIL_LENGTH) {
    errors.push(`email must be ${MAX_EMAIL_LENGTH} characters or fewer`);
  }
  if (body.project_description !== undefined) {
    if (typeof body.project_description !== 'string') {
      errors.push('project_description must be a string');
    } else if (body.project_description.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
      errors.push(`project_description must be ${MAX_PROJECT_DESCRIPTION_LENGTH} characters or fewer`);
    }
  }
  if (body.grant_type !== undefined) {
    if (typeof body.grant_type !== 'string') {
      errors.push('grant_type must be a string');
    } else if (body.grant_type.length > MAX_GRANT_TYPE_LENGTH) {
      errors.push(`grant_type must be ${MAX_GRANT_TYPE_LENGTH} characters or fewer`);
    }
  }
  return { valid: errors.length === 0, errors };
}

const MIN_FILL_MS = 3000;

// A submission counts as spam if the honeypot field was filled (a real
// visitor never sees or fills it) or if it arrived faster than a human
// could plausibly have filled the form - including when _loadedAt is
// missing entirely, which is what a bot posting straight to the API
// without ever loading the page looks like.
export function isSpamSubmission(body, nowMs) {
  if (body && typeof body._gotcha === 'string' && body._gotcha.trim().length > 0) {
    return true;
  }
  const loadedAt = body && body._loadedAt;
  if (typeof loadedAt !== 'number' || !Number.isFinite(loadedAt)) {
    return true;
  }
  return nowMs - loadedAt < MIN_FILL_MS;
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
