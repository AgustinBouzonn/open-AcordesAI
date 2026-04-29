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
