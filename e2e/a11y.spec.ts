import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { apiSetlist, apiSong, apiUser, signIn, skipOnboarding, stubOnlineSearch, type TestUser } from './helpers';

// Auditoría automática de accesibilidad (WCAG 2.1 A/AA) de las pantallas principales.
// Además de los criterios WCAG se activan dos reglas "best-practice" de axe para que la
// jerarquía de títulos no se rompa: un h1 por pantalla y sin saltos de nivel.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page: Page, screen: string) {
  const results = await new AxeBuilder({ page })
    .options({ rules: { 'heading-order': { enabled: true }, 'page-has-heading-one': { enabled: true } } })
    .withTags(WCAG_TAGS)
    // El reproductor embebido es un iframe de YouTube (tercero, fuera de nuestro control).
    .exclude('iframe[src*="youtube.com"]')
    .analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    help: v.help,
    nodes: v.nodes.map((n) => `${n.target.join(' ')} :: ${n.failureSummary?.split('\n').slice(1, 2).join(' ')}`),
  }));
  expect(summary, `${screen}: violaciones de axe`).toEqual([]);
}

let user: TestUser;
let songTitle: string;
let songId: number;
let setlistName: string;

test.beforeAll(async ({ request }) => {
  user = await apiUser(request, 'a11y');
  songTitle = `Accesible ${user.id}`;
  const song = await apiSong(request, user, {
    title: songTitle,
    artist: 'Banda A11y',
    chords: 'C G Am F\nletra de prueba\nDm G C',
  });
  songId = song.id;
  const fav = await request.post(`/api/favorites/${songId}`, { headers: { Authorization: `Bearer ${user.token}` } });
  expect(fav.ok()).toBeTruthy();
  setlistName = `Setlist a11y ${user.id}`;
  await apiSetlist(request, user, setlistName, [songId]);
});

test.beforeEach(async ({ page }) => {
  await skipOnboarding(page);
  await stubOnlineSearch(page);
});

test.describe('sin sesión', () => {
  test('inicio', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoViolations(page, 'inicio');
  });

  test('modal de login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar/ }).first().click();
    await expect(page.getByRole('dialog', { name: 'Iniciar Sesión' })).toBeVisible();
    await expectNoViolations(page, 'modal de login');
  });

  test('afinador', async ({ page }) => {
    await page.goto('/#/tuner');
    await expect(page.getByRole('heading', { name: 'Afinador', level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Ajustes del afinador' }).click();
    await expect(page.getByRole('slider', { name: 'Calibración A4' })).toBeVisible();
    await expectNoViolations(page, 'afinador');
  });

  test('metrónomo', async ({ page }) => {
    await page.goto('/#/metronome');
    await expect(page.getByRole('heading', { name: 'Metrónomo', level: 1 })).toBeVisible();
    await expectNoViolations(page, 'metrónomo');
  });
});

test.describe('con sesión', () => {
  test.beforeEach(async ({ page }) => { await signIn(page, user); });

  test('resultados de búsqueda', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Buscar canción o artista' }).fill(songTitle);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: songTitle })).toBeVisible();
    await expectNoViolations(page, 'búsqueda');
  });

  test('visor de canción, con opiniones abiertas', async ({ page }) => {
    await page.goto(`/#/song/${songId}`);
    await expect(page.getByRole('heading', { name: songTitle, level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Ver comentarios' }).click();
    await expect(page.getByRole('heading', { name: 'Opiniones' })).toBeVisible();
    await expectNoViolations(page, 'visor');
  });

  test('modales del visor: compartir y agregar a setlist', async ({ page }) => {
    await page.goto(`/#/song/${songId}`);
    await page.getByRole('button', { name: 'Compartir' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoViolations(page, 'modal compartir');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Setlist', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Agregar a setlist' }).getByText(setlistName)).toBeVisible();
    await expectNoViolations(page, 'modal agregar a setlist');
  });

  test('favoritos', async ({ page }) => {
    await page.goto('/#/favorites');
    await expect(page.getByRole('button', { name: songTitle })).toBeVisible();
    await expectNoViolations(page, 'favoritos');
  });

  test('setlists (abierta)', async ({ page }) => {
    await page.goto('/#/setlists');
    await page.getByRole('button', { name: new RegExp(`^${setlistName}`) }).click();
    await expect(page.getByRole('button', { name: `${songTitle} Banda A11y` })).toBeVisible();
    await expectNoViolations(page, 'setlists');
  });

  test('modal de importar desde URL con error', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Importar desde URL' }).click();
    const dialog = page.getByRole('dialog', { name: 'Importar desde URL' });
    await dialog.getByRole('textbox', { name: 'URL de la canción' }).fill('https://example.com/cancion');
    await dialog.getByRole('button', { name: 'Importar' }).click();
    await expect(dialog.getByRole('alert')).toContainText('URL no permitida');
    await expectNoViolations(page, 'modal importar URL');
  });

  test('modal de crear canción', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear canción' }).click();
    await expect(page.getByRole('textbox', { name: 'Título *' })).toBeVisible();
    await expectNoViolations(page, 'modal crear canción');
  });

  test('modal de perfil y confirmación de borrado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: `Perfil de ${user.username}` }).click();
    const dialog = page.getByRole('dialog', { name: 'Perfil de usuario' });
    await expect(dialog.getByText('Canciones', { exact: true })).toBeVisible();
    await expectNoViolations(page, 'modal de perfil');
    await dialog.getByRole('button', { name: 'Eliminar mi cuenta' }).click();
    await expect(dialog.getByLabel('Escribí ELIMINAR para confirmar')).toBeVisible();
    await expectNoViolations(page, 'confirmación de borrado');
  });

  test('comunidad e historial', async ({ page }) => {
    await page.goto('/#/community');
    await expect(page.getByRole('heading', { name: 'Comunidad', level: 1 })).toBeVisible();
    // Hay al menos la canción de este archivo: se espera a que la grilla reemplace al skeleton.
    await expect(page.getByRole('main').getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expectNoViolations(page, 'comunidad');

    await page.goto(`/#/song/${songId}`);
    await expect(page.getByRole('heading', { name: songTitle, level: 1 })).toBeVisible();
    await page.goto('/#/history');
    await expect(page.getByRole('button', { name: songTitle })).toBeVisible();
    await expectNoViolations(page, 'historial');
  });
});
