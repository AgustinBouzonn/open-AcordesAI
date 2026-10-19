import { query } from '../db';

/**
 * Un JWT sigue valiendo solo si el usuario existe y su token_version coincide con el del token.
 * Así una cuenta borrada o una contraseña reemplazada cortan las sesiones abiertas sin esperar los 7 días.
 */
export async function isSessionCurrent(userId: number, tokenVersion: number): Promise<boolean> {
  const result = await query('SELECT token_version FROM users WHERE id = $1', [userId]);
  return result.rows.length > 0 && Number(result.rows[0].token_version) === tokenVersion;
}
