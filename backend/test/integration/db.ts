import jwt from 'jsonwebtoken';
import pool from '../../src/db';

const TABLES = [
  'setlist_songs', 'setlists', 'user_song_progress', 'practice_sessions', 'comments',
  'favorites', 'history', 'ratings', 'chord_cache', 'songs', 'users',
];

export async function resetDb(): Promise<void> {
  await pool.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
}

export async function createUser(username: string): Promise<{ id: number; token: string }> {
  const r = await pool.query(
    `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, 'x') RETURNING id`,
    [`${username}@test.com`, username],
  );
  const id = r.rows[0].id as number;
  return { id, token: jwt.sign({ userId: id, username }, process.env.JWT_SECRET!, { expiresIn: '1h' }) };
}

export async function createSong(title: string, artist: string, userId: number, createdAt?: string): Promise<number> {
  const r = await pool.query(
    `INSERT INTO songs (title, artist, user_id, created_at) VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW())) RETURNING id`,
    [title, artist, userId, createdAt ?? null],
  );
  return r.rows[0].id as number;
}

export async function rate(userId: number, songId: number, score: number): Promise<void> {
  await pool.query('INSERT INTO ratings (user_id, song_id, score) VALUES ($1, $2, $3)', [userId, songId, score]);
}

export async function addChords(songId: number): Promise<void> {
  await pool.query(
    `INSERT INTO chord_cache (song_id, instrument, title, artist, content) VALUES ($1, 'guitar', 't', 'a', 'C G Am F')`,
    [songId],
  );
}

export { pool };
