#!/usr/bin/env bash
# Deploy de producción. Corre EN EL VPS, dentro del clon del repo.
#
#   APP_DIR=/ruta/al/repo bash scripts/deploy.sh [sha]
#
# Pasos: fast-forward a <sha> (default origin/main) → build de imágenes →
# pg_dump a backups/ → migraciones (todas idempotentes) → recrear contenedores → esperar /api/health
# en backend y a través de nginx. Si algo falla después de mover el código,
# vuelve al commit anterior y re-levanta.
#
# GitHub Actions (.github/workflows/deploy.yml) lo ejecuta vía `ssh ... bash -s`.
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
TARGET="${1:-origin/main}"
cd "$APP_DIR"

log() { printf '[deploy] %s\n' "$*"; }

git fetch --quiet origin main
TARGET_SHA="$(git rev-parse "$TARGET^{commit}")"
PREV="$(git rev-parse HEAD)"

if ! git merge-base --is-ancestor "$TARGET_SHA" origin/main; then
  log "ERROR: $TARGET_SHA no está en origin/main, no se despliega."
  exit 1
fi
if [ "$PREV" != "$TARGET_SHA" ] && git merge-base --is-ancestor "$TARGET_SHA" "$PREV"; then
  log "Ya está desplegado un commit más nuevo ($PREV). Nada que hacer."
  exit 0
fi

# --ff-only: si el server tiene commits locales, falla sin tocar nada.
git merge --ff-only --quiet "$TARGET_SHA"
log "Código: ${PREV:0:7} -> ${TARGET_SHA:0:7}"

rollback() {
  log "FALLÓ el deploy, volviendo a ${PREV:0:7}"
  # --keep conserva cambios locales no commiteados (p. ej. .env del server).
  git reset --quiet --keep "$PREV"
  docker compose up -d --build --remove-orphans || true
  exit 1
}
trap rollback ERR

log "Build de imágenes"
docker compose build

log "Migraciones"
docker compose up -d postgres
for _ in $(seq 1 30); do
  docker compose exec -T postgres pg_isready -U acordesai -q && break
  sleep 2
done
log "Backup previo a migraciones"
mkdir -p backups
docker compose exec -T postgres pg_dump -U acordesai -Fc acordesai \
  > "backups/pre-deploy-$(date +%Y%m%d-%H%M%S)-${TARGET_SHA:0:7}.dump"
# Conserva los últimos 10 dumps de deploy.
ls -1t backups/pre-deploy-*.dump 2>/dev/null | tail -n +11 | xargs -r rm -- || true

for m in backend/migrations/*.sql; do
  docker compose exec -T postgres psql -U acordesai -d acordesai -v ON_ERROR_STOP=1 -q < "$m"
done

log "Recreando contenedores"
docker compose up -d --remove-orphans

log "Esperando /api/health"
healthy=0
for _ in $(seq 1 30); do
  if docker compose exec -T backend wget -qO /dev/null http://127.0.0.1:3001/api/health 2>/dev/null \
    && docker compose exec -T nginx wget -qO /dev/null http://127.0.0.1/api/health 2>/dev/null; then
    healthy=1
    break
  fi
  sleep 3
done
[ "$healthy" = 1 ] || false # dispara el trap → rollback

trap - ERR
docker image prune -f >/dev/null || true
log "OK: ${TARGET_SHA:0:7} en producción"
