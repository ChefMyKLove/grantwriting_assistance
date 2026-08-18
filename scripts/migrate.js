// scripts/migrate.js
import { readFileSync } from 'node:fs';
import { sql } from '../lib/db.js';

const schema = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');

async function migrate() {
  const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
