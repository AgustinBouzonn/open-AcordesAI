import { expect, test, type Page, type APIRequestContext } from '@playwright/test';

const unique = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

async function apiUser(request: APIRequestContext) {
  const id = unique();
  const r = await request.post('/api/auth/register', {
    data: { email: `e2e${id}@test.com`, username: `e2e${id}`, password: 'secret123' },
  });
  expect(r.ok()).toBeTruthy();
  return { id, ...(await r.json()) as { token: string } };
}

// Salvo en el test del onboarding, se arranca como usuario que ya lo vio.
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes('onboarding')) return;
  await page.addInitScript(() => localStorage.setItem('acordesai_onboarded_v1', '1'));
});

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
};

test('home loads without runtime errors and the API is reachable', async ({ page, request }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Entrar/ }).first()).toBeVisible();
  expect((await request.get('/api/health')).ok()).toBeTruthy();
  expect(errors).toEqual([]);
});

test('the onboarding shows on the first visit and can be skipped', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Saltar' }).click();
  await expect(page.getByRole('button', { name: 'Saltar' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Saltar' })).toHaveCount(0);
});

test('a user can register from the UI', async ({ page }) => {
  const errors = collectErrors(page);
  const id = unique();
  await page.goto('/');
  await page.getByRole('button', { name: /Entrar/ }).first().click();
  await page.getByRole('button', { name: 'Regístrate' }).click();
  await page.getByPlaceholder('Usuario').fill(`ui${id}`);
  await page.getByPlaceholder('Email').fill(`ui${id}@test.com`);
  await page.getByPlaceholder('Contraseña').fill('secret123');
  await page.locator('form').getByRole('button', { name: 'Registrarse' }).click();

  await expect(page.getByRole('button', { name: /^Perfil de ui/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Entrar/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a song created through the API can be found and opened', async ({ page, request }) => {
  const errors = collectErrors(page);
  const user = await apiUser(request);
  const title = `Cancion E2E ${user.id}`;
  const created = await request.post('/api/songs', {
    headers: { Authorization: `Bearer ${user.token}` },
    data: { title, artist: 'Banda de Prueba', lyrics: 'C G Am F\nletra de prueba' },
  });
  expect(created.status()).toBe(201);
  const song = await created.json() as { id: number };

  await page.goto(`/#/song/${song.id}`);
  await expect(page.getByText(title).first()).toBeVisible();
  expect(errors).toEqual([]);
});
