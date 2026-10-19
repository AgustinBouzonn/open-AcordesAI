#!/usr/bin/env bash
# Build de Vercel (vercel.json → buildCommand). El backend ya quedó compilado en el installCommand.
# Las migraciones van al final: si el build del frontend falla, la base no se toca. Usan la conexión
# directa de Neon (DATABASE_URL_UNPOOLED o POSTGRES_URL_NON_POOLING, las crea la integración) y caen en
# DATABASE_URL si no está ninguna.
set -euo pipefail

npm run build

if [ "${VERCEL_ENV:-}" = production ]; then
  DATABASE_URL="${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-${DATABASE_URL:-}}}" npm --prefix backend run migrate
fi
