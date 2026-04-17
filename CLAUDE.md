# Infraestructura

## VPS personal (Hostinger)
- **IP pública:** `195.200.1.74`
- **Panel:** EasyPanel (Traefik como reverse proxy, red Docker `easypanel` / `easypanel-webpage`).
- **Dominio de producción:** `acordesai.bthings.com.ar`
- **DNS:** apuntado a Cloudflare en modo proxy (naranja). Cloudflare termina TLS en el edge y reenvía al origen `195.200.1.74`.

## Flujo de request
cliente → Cloudflare (TLS) → VPS `195.200.1.74` → Traefik (EasyPanel) → contenedor `nginx` (puerto 80) → `backend` (puerto 3001) / estáticos del frontend.

## Puntos frágiles conocidos
- `update-traefik.sh` escribe a mano la IP del contenedor `open-acordesai_nginx_1` en `/etc/easypanel/traefik/config/main.yaml`. Si Docker recrea el contenedor, la IP cambia y Traefik queda apuntando a una IP muerta.
- `nginx.conf` tiene hardcodeado `proxy_pass http://10.11.243.151:3001` al backend en la red `easypanel`. Mismo problema: si cambia la IP del container, se rompe.
