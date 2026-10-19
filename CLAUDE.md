# Infraestructura

## Producción: Vercel + Neon (plan gratis)
- **Dominio:** `acordesai.bthings.com.ar` (CNAME a Vercel, DNS only en Cloudflare). Guía completa: `docs/deploy-vercel.md`.
- **Vercel** sirve `dist/` y la API como una sola función serverless: `api/index.js` exporta la app Express de `backend/dist/app.js`; `vercel.json` reescribe `/api/*` hacia ella. Región `gru1` (São Paulo).
- **Neon** (Postgres, `aws-sa-east-1`): `DATABASE_URL` es la conexión con pooler (app); `DATABASE_URL_UNPOOLED` la directa (migraciones).
- `vercel.json`: el `installCommand` compila el backend (la función importa JS ya compilado: Vercel no puede transpilar con TypeScript 7). `ignoreCommand` construye solo producción: un preview usaría la base de producción.
- `scripts/vercel-build.sh` hace el build del frontend y después `npm --prefix backend run migrate` (solo `VERCEL_ENV=production`). `migrate.js` corre **todas** las migraciones en cada deploy; `schema_migrations` es solo registro.
- Headers de seguridad: los mismos en `vercel.json` y `nginx.conf` (lo verifica `test/vercelConfig.test.ts`).
- Serverless: nada de estado en memoria que tenga que sobrevivir entre requests (cada instancia tiene el suyo; los rate limits son aproximados). El pool de pg tiene listener de `'error'`: Neon corta las conexiones al suspender la base.

## Self-hosting (Docker Compose)
`docker-compose.yml` levanta Postgres, backend y nginx (con labels de Traefik/EasyPanel, como estaba en el VPS anterior). nginx hace `proxy_pass` al backend por nombre DNS (`open-acordesai-backend-1:3001`, con `resolver 127.0.0.11`). Compose v2 usa guiones en los nombres (`open-acordesai-nginx-1`); containers con `_` son huérfanos: `docker compose up -d --force-recreate --remove-orphans`.

## Import desde URL
- Endpoint: `POST /api/import/from-url` (requireAuth) con body `{ url }`. Valida hostname contra `ALLOWED_HOSTS` (Cifra Club, Ultimate Guitar, CifraSpot), scrapea el `<pre>` más largo y el `og:title`, inserta en `songs` + `chord_cache (instrument='guitar')` atómicamente. Dedup por `source_url` (devuelve `existed: true`).
- Frontend: botón flotante ⬇ en `App.tsx` → `ImportUrlModal` → llama `api.imports.fromUrl(url)` → navega a `/song/:id`.
- El mismo patrón (insert en `songs` + `chord_cache` con mismo contenido) lo usa `scripts/import-bulk.mjs` para imports masivos por CLI.
- Carga masiva desde Ultimate Guitar: `DATABASE_URL=... node scripts/seed-songs.mjs [--per-artist 15] [--top-pages 4] [--artists "A,B"] [--dry-run]`. Deduplica por `source_url` y título+artista, así que se puede volver a correr. Con un host de Neon usa `@neondatabase/serverless` (HTTP, puerto 443).
- Cifra Club (Akamai) responde 403 a IPs de datacenter. A UG, el `fetch` de Node le da un challenge de Cloudflare (429) y curl no: el seed baja con curl y sin `Accept-Language` (con `es` redirige a `es.ultimate-guitar.com`).

## Automatización (CI/CD)
- **CI** (`.github/workflows/ci.yml`): lint, typecheck, tests frontend (vitest), build, tests backend, migraciones dos veces, integración, e2e. El job `vercel-build` corre `vercel build` con un proyecto ficticio y carga la función empaquetada. Corre en cada push/PR.
- **Deploy:** la integración de Git de Vercel despliega cada push a `main` (no hay workflow propio). Si el build o una migración fallan, queda la versión anterior.
- Toda migración nueva en `backend/migrations/` debe ser idempotente (`IF NOT EXISTS` / `IF EXISTS`): el deploy las corre todas en cada release.
- Sesiones de Claude en la nube: `.claude/hooks/session-start.sh` instala dependencias para poder correr tests.
- **@claude en GitHub** (`.github/workflows/claude.yml`): mencionar `@claude` en un issue/PR, o poner la etiqueta `claude` a un issue, lanza Claude Code en Actions. Requiere el secret `CLAUDE_CODE_OAUTH_TOKEN` o `ANTHROPIC_API_KEY`.

## App Android (Capacitor)
- `capacitor.config.ts` define `server.url`: la app nativa carga el sitio remoto, así que `window.location.origin` es el dominio de producción. Si se quita `server.url`, el origen pasa a ser local.
- Los enlaces para compartir se arman con `buildShareUrl` (`services/appUrl.ts`), que usa `VITE_PUBLIC_APP_URL` y cae en el origen de la página. No armar enlaces compartibles con `window.location.origin` directo.

## Reglas para agentes
- Antes de pushear: `npm run lint && npm run typecheck && npm run test:run && npm run test:backend`.
- Linter: oxlint (`.oxlintrc.json`), no ESLint: typescript-eslint no soporta TypeScript 7 (pide `<6.1`).
- Nunca pushear directo a `main`: siempre PR con CI en verde.
- Cada bug arreglado trae un test de regresión. Si el bug enseña algo no obvio del proyecto, agregar una línea acá.
- No poner en `manualChunks` (vite.config.ts) librerías que solo se cargan con `import()` y que a su vez hacen `import()` internos (jspdf): Rollup mete el preload helper de Vite en ese chunk y el entry lo importa estáticamente, sumando cientos de KB a la carga inicial. Verificar los `modulepreload` de `dist/index.html` después de tocar el chunking.

## Tests e2e (Playwright)
- `e2e/smoke.spec.ts` (humo), `e2e/flows.spec.ts` (favoritos, setlists + link público, controles del visor, import por URL, borrado de cuenta) y `e2e/a11y.spec.ts` (axe). Helpers de setup por API en `e2e/helpers.ts`.
- El limitador de `/api/auth` es por IP (10 cada 15 min) y el backend confía en `X-Forwarded-For` (`trust proxy = 1`): `apiUser()` registra cada usuario con una IP privada distinta. No registrar usuarios desde la UI salvo en el test que prueba eso.
- `POST /api/favorites/:id` es idempotente: para alternar un favorito hay que saber el estado actual (`toggleFavorite(id, isFav)`).
- Favoritos e historial se recargan al entrar a su pestaña (`App.tsx`), no solo al loguearse.
- En mobile la barra inferior mide `h-16` (z-50): cualquier botón `fixed` abajo tiene que ir por encima (`bottom-20`).

## Accesibilidad
- `e2e/a11y.spec.ts` corre axe (WCAG 2.1 A/AA + `heading-order` y `page-has-heading-one`) en las pantallas principales y tiene que dar cero violaciones. Única exclusión: el iframe de YouTube (tercero).
- Blanco sobre `#FF6B00` da 2.8:1 (no pasa AA): los botones rellenos con texto usan `bg-brand-strong` (#C25100, 4.7:1). `text-brand` sobre fondos oscuros sí pasa.
- Sobre fondos `dark-*` el gris mínimo para texto es `text-gray-400` (`gray-500` da ~3.5:1).
- Tarjetas clickeables: `CardButton` (un `<button>` real con `::after` estirado sobre la tarjeta `relative`), nunca `<div onClick>`.
- Cada pantalla tiene un único `h1`; las tarjetas son `h2` (o `h3` debajo de una sección `h2`). Todo input/select lleva `<label htmlFor>` o `aria-label`.
- La base de la API sale siempre de `getApiBase()` / `getAbsoluteApiBase()` en `services/appUrl.ts` (incluido el inicio del login social): no armar URLs con `window.location.origin + '/api'`, porque en una app nativa empaquetada el origen es `https://localhost`.
