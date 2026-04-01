import { Pool, QueryResult } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const pool = new Pool({
  connectionString: DATABASE_URL,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: (string | number | boolean | null)[]): Promise<QueryResult> =>
  pool.query(text, params);

export default pool;
