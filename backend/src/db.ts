import { Pool, QueryResult } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurada. La aplicación no puede iniciar de forma segura.');
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
