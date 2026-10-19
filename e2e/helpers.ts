import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const unique = () => `${Date.now()}${Math.floor(Math.random() * 100000)}`;

// El backend corre con `trust proxy = 1` y el limitador de /auth es por IP (10 cada 15 min).
// Cada llamada de setup se presenta con una IP privada distinta para no chocar con el límite
// cuando la suite registra varios usuarios seguidos. Es solo para el setup vía API: los flujos
// de UI siguen pasando por el limitador real.
const fakeClientIp = () =>
  `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${1 + Math.floor(Math.random() * 253)}`;

export interface TestUser {
  id: string;
  email: string;
  username: string;
  password: string;
  token: string;
  ip: string;
}

export async function apiUser(request: APIRequestContext, prefix = 'e2e'): Promise<TestUser> {
  const id = unique();
  const ip = fakeClientIp();
  const email = `${prefix}${id}@test.com`;
  const username = `${prefix}${id}`;
  const password = 'secret123';
  const r = await request.post('/api/auth/register', {
    headers: { 'X-Forwarded-For': ip },
    data: { email, username, password },
  });
  expect(r.ok(), await r.text()).toBeTruthy();
  const { token } = await r.json() as { token: string };
  return { id, email, username, password, token, ip };
}

const auth = (user: TestUser) => ({ Authorization: `Bearer ${user.token}` });

export async function apiSong(
  request: APIRequestContext,
  user: TestUser,
  data: { title: string; artist: string; chords?: string },
): Promise<{ id: number; title: string }> {
  const created = await request.post('/api/songs', {
    headers: auth(user),
    data: { title: data.title, artist: data.artist, lyrics: '' },
  });
  expect(created.status()).toBe(201);
  const song = await created.json() as { id: number; title: string };
  if (data.chords) {
    const saved = await request.put(`/api/songs/${song.id}/chords`, {
      headers: auth(user),
      data: { chords: data.chords, instrument: 'guitar' },
    });
    expect(saved.ok(), await saved.text()).toBeTruthy();
  }
  return song;
}

export async function apiSetlist(
  request: APIRequestContext,
  user: TestUser,
  name: string,
  songIds: number[] = [],
): Promise<{ id: number; name: string }> {
  const r = await request.post('/api/setlists', { headers: auth(user), data: { name } });
  expect(r.status()).toBe(201);
  const setlist = await r.json() as { id: number; name: string };
  for (const songId of songIds) {
    const added = await request.post(`/api/setlists/${setlist.id}/songs`, { headers: auth(user), data: { songId } });
    expect(added.status()).toBe(201);
  }
  return setlist;
}

// Arranca la pestaña ya logueada (token en localStorage) y con el onboarding visto.
// El token se inyecta una sola vez por pestaña: si el test cierra sesión y recarga, sigue deslogueado.
export async function signIn(page: Page, user: TestUser) {
  await page.addInitScript((token) => {
    if (sessionStorage.getItem('e2e_token_injected')) return;
    sessionStorage.setItem('e2e_token_injected', '1');
    localStorage.setItem('token', token);
  }, user.token);
}

export async function skipOnboarding(page: Page) {
  await page.addInitScript(() => localStorage.setItem('acordesai_onboarded_v1', '1'));
}

// La búsqueda online consulta iTunes desde el backend: en los tests se responde vacío para no salir a internet.
export async function stubOnlineSearch(page: Page) {
  await page.route(/\/api\/search\?q=/, (route) => route.fulfill({ json: { results: [] } }));
}

export const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
};
