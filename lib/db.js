// lib/db.js
import { createPool } from '@vercel/postgres';

// GRANTS_DB_URL is our own setting: the Neon-integration POSTGRES_URL is
// locked in Vercel and can't be edited when its password goes stale.
export const db = createPool({ connectionString: process.env.GRANTS_DB_URL || process.env.POSTGRES_URL });
export const sql = db.sql.bind(db);
