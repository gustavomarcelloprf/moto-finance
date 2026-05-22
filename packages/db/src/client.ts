import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

/**
 * Cliente Drizzle para Postgres (Supabase).
 *
 * Uso server-only — NUNCA importar em código client. Use Supabase JS SDK
 * (com RLS) para leituras autenticadas no client.
 *
 * Connection string vem de DATABASE_URL (PgBouncer porta 6543) para queries
 * normais. Para migrations use DATABASE_DIRECT_URL (porta 5432).
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Em build time, DATABASE_URL pode não existir. Lazy-failure on first use.
  console.warn('[db] DATABASE_URL not set — client will fail on first query.');
}

const queryClient = postgres(connectionString ?? '', {
  prepare: false, // requerido para PgBouncer transaction mode
  max: 1 // Vercel serverless — 1 conexão por invocação
});

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;

export { schema };
