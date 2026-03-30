import { Pool, QueryResult } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL environment variable is not set. Database connection will fail.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: (string | number | boolean | null)[]): Promise<QueryResult> =>
  pool.query(text, params);

export default pool;
