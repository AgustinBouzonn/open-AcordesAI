import { describe, expect, it } from 'vitest';
import pool from '../src/db';

describe('db pool', () => {
  // Regresión: sin listener, un cliente ocioso cortado por el servidor (Neon suspendiendo la base)
  // emite 'error' sin manejar y Node mata el proceso.
  it('sobrevive a un error de un cliente ocioso', () => {
    expect(pool.listenerCount('error')).toBeGreaterThan(0);
    expect(() => pool.emit('error', new Error('terminating connection due to administrator command'))).not.toThrow();
  });
});
