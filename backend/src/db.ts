import { Pool, QueryResult } from 'pg';
import { DATABASE_URL } from './env';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: (string | number | boolean | null)[]): Promise<QueryResult> =>
  pool.query(text, params);

export default pool;
