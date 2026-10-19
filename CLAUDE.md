# Infraestructura

## VPS personal (Hostinger)
- **IP pública:** `195.200.1.74`
- **Panel:** EasyPanel (Traefik como reverse proxy, red Docker `easypanel` / `easypanel-webpage`).
- **Dominio de producción:** `acordesai.bthings.com.ar`
- **DNS:** apuntado a Cloudflare en modo proxy (naranja). Cloudflare termina TLS en el edge y reenvía al origen `195.200.1.74`.

## Flujo de request
cliente → Cloudflare (TLS) → VPS `195.200.1.74` → Traefik (EasyPanel) → contenedor `open-acordesai-nginx-1` (puerto 80) → `open-acordesai-backend-1` (puerto 3001) / estáticos del frontend.

## Enrutado (actual)
- Traefik descubre el routing por **labels Docker** en el servicio `nginx` del `docker-compose.yml` (provider `docker` ya habilitado en Traefik). No se editan archivos en `/etc/easypanel/traefik/config/`: Easypanel regenera `main.yaml` desde su DB y borra entradas externas. Las labels sobreviven a cualquier regeneración.
- Para que Traefik pueda resolver el container, nginx debe estar en la red `easypanel` y tener la label `traefik.docker.network=easypanel`.
- nginx.conf: `proxy_pass` al backend por nombre DNS (`open-acordesai-backend-1:3001`). Requiere `resolver 127.0.0.11` (ya configurado) para que nginx refresque el nombre.
- `update-traefik.sh` fue eliminado (ya no hay IPs hardcodeadas).

## Convención de nombres Docker Compose
Compose v2 usa guiones (`open-acordesai-nginx-1`), no underscores. Si se ven containers viejos con `_`, son huérfanos: `docker compose up -d --force-recreate --remove-orphans`.

## Import desde URL
- Endpoint: `POST /api/import/from-url` (requireAuth) con body `{ url }`. Valida hostname contra `ALLOWED_HOSTS` (Cifra Club, Ultimate Guitar, CifraSpot), scrapea el `<pre>` más largo y el `og:title`, inserta en `songs` + `chord_cache (instrument='guitar')` atómicamente. Dedup por `source_url` (devuelve `existed: true`).
- Frontend: botón flotante ⬇ en `App.tsx` → `ImportUrlModal` → llama `api.imports.fromUrl(url)` → navega a `/song/:id`.
- El mismo patrón (insert en `songs` + `chord_cache` con mismo contenido) lo usa `scripts/import-bulk.mjs` para imports masivos por CLI.

## Automatización (CI/CD)
- **CI** (`.github/workflows/ci.yml`): typecheck, tests frontend (vitest), build, tests backend. Corre en cada push/PR.
- **Deploy** (`.github/workflows/deploy.yml`): cuando CI pasa en un push a `main`, entra por SSH al VPS y ejecuta `scripts/deploy.sh <sha>` (fast-forward, build, migraciones idempotentes, `docker compose up -d`, health check). Si el health falla, vuelve solo al commit anterior. También se puede lanzar a mano (workflow_dispatch).
- Secrets en GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_DIR` (opcionales `VPS_PORT`, `VPS_KNOWN_HOSTS`). Sin ellos el deploy se omite con un warning.
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
