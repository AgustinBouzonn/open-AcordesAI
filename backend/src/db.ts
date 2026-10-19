import { Pool, PoolClient, QueryResult } from 'pg';
import { DATABASE_URL } from './env';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Neon suspende la base tras 5 min sin uso y corta las conexiones abiertas: el cliente ocioso emite
// 'error' y, sin listener, Node lo trata como excepción no capturada y tira la función entera.
// El pool ya descarta ese cliente; la próxima consulta abre uno nuevo.
pool.on('error', (err) => {
  console.error('[db] idle client error', err.message);
});

export type QueryParam = string | number | boolean | null | Date | number[] | string[];

export const query = (text: string, params?: QueryParam[]): Promise<QueryResult> =>
  pool.query(text, params);

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch { /* noop */ }
    throw e;
  } finally {
    client.release();
  }
}

export default pool;
