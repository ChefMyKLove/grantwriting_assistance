-- grants.chefmyklove backend schema

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_description TEXT,
  grant_type TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  grant_name TEXT,
  hour_cap_tier TEXT,
  hours_used NUMERIC NOT NULL DEFAULT 0,
  case_number TEXT,
  deadline DATE,
  submission_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
