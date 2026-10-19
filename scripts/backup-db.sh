#!/usr/bin/env bash
# Backup diario de Postgres. Corre EN EL VPS, dentro del clon del repo.
#
#   APP_DIR=/ruta/al/repo bash scripts/backup-db.sh
#
# Cron sugerido (03:15 todos los días):
#   15 3 * * * APP_DIR=/ruta/al/repo bash /ruta/al/repo/scripts/backup-db.sh >> /var/log/acordesai-backup.log 2>&1
#
# Opcional: RCLONE_REMOTE=b2:acordesai-backups copia cada dump fuera del VPS
# (requiere `rclone config` previo). Sin copia externa, perder el VPS es perder la base.
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
KEEP="${KEEP:-14}"
cd "$APP_DIR"

mkdir -p backups
file="backups/daily-$(date +%Y%m%d-%H%M%S).dump"
docker compose exec -T postgres pg_dump -U acordesai -Fc acordesai > "$file"
[ -s "$file" ] || { echo "[backup] dump vacío: $file"; rm -f "$file"; exit 1; }
echo "[backup] OK $file ($(du -h "$file" | cut -f1))"

if [ -n "${RCLONE_REMOTE:-}" ]; then
  rclone copy "$file" "$RCLONE_REMOTE"
  echo "[backup] copiado a $RCLONE_REMOTE"
fi

ls -1t backups/daily-*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -- || true
