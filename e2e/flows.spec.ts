import { expect, test, type Page } from '@playwright/test';
import { apiSong, apiUser, collectErrors, signIn, skipOnboarding, unique, type TestUser } from './helpers';

// Flujos principales con interacciones reales de UI. Los datos que son solo preparación
// (usuario, canciones) se crean por API; lo que se prueba se hace desde la interfaz.

const CHORDS = 'C G Am F\nEsta es la letra de prueba\nDm G C';

let user: TestUser;

test.beforeAll(async ({ request }) => {
  user = await apiUser(request, 'flow');
});

test.beforeEach(async ({ page }) => {
  await skipOnboarding(page);
});

// La barra visible depende del viewport (arriba en desktop, abajo en mobile); la otra está oculta por CSS.
const nav = (page: Page) => page.getByRole('navigation');

test('favoritos: agregar desde el visor, verla en Favoritos y quitarla', async ({ page, request }) => {
  const errors = collectErrors(page);
  const song = await apiSong(request, user, { title: `Favorita ${unique()}`, artist: 'Banda Fav', chords: CHORDS });
  await signIn(page, user);

  await page.goto(`/#/song/${song.id}`);
  await page.getByRole('button', { name: 'Añadir a favoritos' }).click();
  await expect(page.getByRole('button', { name: 'Quitar de favoritos' })).toBeVisible();

  await nav(page).getByRole('button', { name: 'Favoritos' }).click();
  await expect(page.getByRole('heading', { name: 'Mis Favoritos', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: song.title }).click();

  await expect(page.getByRole('heading', { name: song.title, level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Quitar de favoritos' }).click();
  await expect(page.getByRole('button', { name: 'Añadir a favoritos' })).toBeVisible();

  await nav(page).getByRole('button', { name: 'Favoritos' }).click();
  await expect(page.getByRole('heading', { name: 'Mis Favoritos', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: song.title })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe('setlists', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('crear, agregar una canción desde el visor, reordenar y abrir el link público', async ({ page, request, browser }) => {
    const errors = collectErrors(page);
    const id = unique();
    const first = await apiSong(request, user, { title: `Primera ${id}`, artist: 'Banda Set', chords: CHORDS });
    const second = await apiSong(request, user, { title: `Segunda ${id}`, artist: 'Banda Set', chords: CHORDS });
    const setlistName = `Show ${id}`;
    await signIn(page, user);

    // Crear la setlist desde la página.
    await page.goto('/#/setlists');
    await page.getByRole('button', { name: 'Nueva' }).click();
    await page.getByRole('textbox', { name: 'Nombre de la nueva setlist' }).fill(setlistName);
    await page.getByRole('button', { name: 'Crear setlist' }).click();
    const setlistRow = page.getByRole('button', { name: new RegExp(`^${setlistName}`) });
    await expect(setlistRow).toContainText('0 canciones');

    // Agregar la primera canción desde el visor.
    await page.goto(`/#/song/${first.id}`);
    await page.getByRole('button', { name: 'Setlist', exact: true }).click();
    await page.getByRole('dialog', { name: 'Agregar a setlist' }).getByRole('button', { name: new RegExp(`^${setlistName}`) }).click();
    await expect(page.getByText('Agregada a la setlist')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Agregar a setlist' })).toHaveCount(0);

    // La segunda entra por API (solo preparación para poder reordenar).
    const list = await request.get('/api/setlists', { headers: { Authorization: `Bearer ${user.token}` } });
    const created = (await list.json() as { id: number; name: string }[]).find((s) => s.name === setlistName)!;
    const added = await request.post(`/api/setlists/${created.id}/songs`, {
      headers: { Authorization: `Bearer ${user.token}` },
      data: { songId: second.id },
    });
    expect(added.status()).toBe(201);

    await page.goto('/#/setlists');
    await page.getByRole('button', { name: new RegExp(`^${setlistName}`) }).click();
    const songRows = page.getByRole('button', { name: new RegExp(`^(Primera|Segunda) ${id}`) });
    await expect(songRows).toHaveText([new RegExp(`Primera ${id}`), new RegExp(`Segunda ${id}`)]);

    // Reordenar: la segunda pasa a ser la primera y el orden persiste.
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith(`/api/setlists/${created.id}/order`) && r.request().method() === 'PUT' && r.ok()),
      page.getByRole('button', { name: `Mover Segunda ${id} arriba` }).click(),
    ]);
    await expect(songRows).toHaveText([new RegExp(`Segunda ${id}`), new RegExp(`Primera ${id}`)]);
    await page.reload();
    await page.getByRole('button', { name: new RegExp(`^${setlistName}`) }).click();
    await expect(songRows).toHaveText([new RegExp(`Segunda ${id}`), new RegExp(`Primera ${id}`)]);

    // Compartir: el link copiado abre la página pública sin sesión.
    await page.getByRole('button', { name: 'Compartir setlist' }).click();
    await expect(page.getByText('Link copiado al portapapeles')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copiar link público' })).toBeVisible();
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareUrl).toMatch(/\/#\/shared\/setlist\/[A-Za-z0-9_-]+$/);

    const anonymous = await browser.newContext({ serviceWorkers: 'block' });
    await anonymous.addInitScript(() => localStorage.setItem('acordesai_onboarded_v1', '1'));
    const publicPage = await anonymous.newPage();
    // El link usa la URL pública de la app (VITE_PUBLIC_APP_URL, que en el build de producción
    // es el dominio real): se abre la misma ruta contra el servidor de los tests.
    await publicPage.goto(`/${new URL(shareUrl).hash}`);
    await expect(publicPage.getByRole('heading', { name: setlistName, level: 1 })).toBeVisible();
    await expect(publicPage.getByText(`por ${user.username}`)).toBeVisible();
    await expect(publicPage.getByRole('heading', { level: 2 })).toHaveText([`Segunda ${id}`, `Primera ${id}`]);
    await publicPage.getByRole('button', { name: `Segunda ${id}` }).click();
    await expect(publicPage.getByRole('heading', { name: `Segunda ${id}`, level: 1 })).toBeVisible();
    await anonymous.close();
    expect(errors).toEqual([]);
  });
});

test('visor: transponer, capo y tamaño de letra cambian el cifrado mostrado', async ({ page, request }) => {
  const errors = collectErrors(page);
  const song = await apiSong(request, user, { title: `Transporte ${unique()}`, artist: 'Banda Tono', chords: CHORDS });
  await signIn(page, user);
  await page.goto(`/#/song/${song.id}`);

  const sheet = page.locator('pre');
  await expect(sheet).toContainText('C G Am F');

  const transpose = page.getByRole('group', { name: 'Transposición' });
  await transpose.getByRole('button', { name: /subir un semitono/ }).click();
  await expect(transpose).toContainText('+1');
  await expect(sheet).toContainText('C# G# A#m F#');
  await expect(sheet).toContainText('D#m G# C#');

  await transpose.getByRole('button', { name: /bajar un semitono/ }).click();
  await expect(transpose).toContainText('Original');
  await expect(sheet).toContainText('C G Am F');

  // Capo 2: el cifrado baja dos semitonos para tocarlo con formas más cómodas.
  const capo = page.getByRole('group', { name: 'Capo' });
  await capo.getByRole('button', { name: 'Subir capo' }).click();
  await capo.getByRole('button', { name: 'Subir capo' }).click();
  await expect(capo).toContainText('Capo 2');
  await expect(sheet).toContainText('A# F Gm D#');
  await capo.getByRole('button', { name: 'Bajar capo' }).click();
  await capo.getByRole('button', { name: 'Bajar capo' }).click();
  await expect(capo).toContainText('Capo —');
  await expect(sheet).toContainText('C G Am F');

  await expect(sheet).toHaveCSS('font-size', '16px');
  await page.getByRole('button', { name: 'Aumentar tamaño de fuente' }).click();
  await expect(sheet).toHaveCSS('font-size', '18px');
  await page.getByRole('button', { name: 'Reducir tamaño de fuente' }).click();
  await page.getByRole('button', { name: 'Reducir tamaño de fuente' }).click();
  await expect(sheet).toHaveCSS('font-size', '14px');
  expect(errors).toEqual([]);
});

test('importar desde URL: el modal abre y rechaza un sitio no permitido', async ({ page }) => {
  const errors = collectErrors(page);
  await signIn(page, user);
  await page.goto('/');

  await page.getByRole('button', { name: 'Importar desde URL' }).click();
  const dialog = page.getByRole('dialog', { name: 'Importar desde URL' });
  await expect(dialog).toBeVisible();
  const importButton = dialog.getByRole('button', { name: 'Importar' });
  await expect(importButton).toBeDisabled();

  // Solo validación: el backend rechaza el host antes de intentar descargar nada.
  await dialog.getByRole('textbox', { name: 'URL de la canción' }).fill('https://example.com/cancion/123');
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/import/from-url')),
    importButton.click(),
  ]);
  expect(response.status()).toBe(400);
  await expect(dialog.getByRole('alert')).toHaveText(/URL no permitida/);
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('borrar la cuenta desde el perfil cierra la sesión y las credenciales dejan de servir', async ({ page, request }) => {
  const errors = collectErrors(page);
  const doomed = await apiUser(request, 'bye');
  await signIn(page, doomed);
  await page.goto('/');

  await page.getByRole('button', { name: `Perfil de ${doomed.username}` }).click();
  const dialog = page.getByRole('dialog', { name: 'Perfil de usuario' });
  await dialog.getByRole('button', { name: 'Eliminar mi cuenta' }).click();
  const confirm = dialog.getByRole('button', { name: 'Eliminar', exact: true });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel('Escribí ELIMINAR para confirmar').fill('eliminar');
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel('Escribí ELIMINAR para confirmar').fill('ELIMINAR');
  await confirm.click();

  await expect(page.getByText('Tu cuenta y tus datos se eliminaron')).toBeVisible();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: `Perfil de ${doomed.username}` })).toHaveCount(0);

  // Volver a entrar con las mismas credenciales falla.
  await page.getByRole('button', { name: /Entrar/ }).first().click();
  const auth = page.getByRole('dialog', { name: 'Iniciar Sesión' });
  await auth.getByRole('textbox', { name: 'Email' }).fill(doomed.email);
  await auth.getByLabel('Contraseña').fill(doomed.password);
  await auth.locator('form').getByRole('button', { name: 'Entrar' }).click();
  await expect(auth.getByRole('alert')).toHaveText('Email o contraseña incorrectos');
  await expect(page.getByRole('button', { name: `Perfil de ${doomed.username}` })).toHaveCount(0);
  expect(errors).toEqual([]);
});
