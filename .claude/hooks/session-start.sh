#!/usr/bin/env bash
# Instala dependencias al abrir una sesión de Claude Code en la nube,
# para que el agente pueda correr typecheck y tests antes de pushear.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

cd "$CLAUDE_PROJECT_DIR"
# Puppeteer solo se usa en runtime para scrapear; los tests no necesitan Chromium.
export PUPPETEER_SKIP_DOWNLOAD=1
npm install --no-audit --no-fund --loglevel=error
npm --prefix backend install --no-audit --no-fund --loglevel=error
