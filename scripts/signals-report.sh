#!/usr/bin/env bash
# Reporte de señales de producto en Markdown. Corre EN EL VPS, dentro del clon del repo.
#
#   APP_DIR=/ruta/al/repo DAYS=7 bash scripts/signals-report.sh > reporte.md
#
# Lo usa .github/workflows/weekly-signals.yml para abrir un issue semanal.
# El repo es público: el reporte solo publica agregados (hosts, motivos, conteos) y
# búsquedas repetidas por 3+ veces. Imprime NO_EVENTS si no hubo actividad.
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
DAYS="${DAYS:-7}"
[[ "$DAYS" =~ ^[0-9]+$ ]] || { echo "DAYS inválido" >&2; exit 1; }
cd "$APP_DIR"

# shellcheck disable=SC2206
PSQL=(${PSQL:-docker compose exec -T postgres psql -U acordesai -d acordesai})
q() { "${PSQL[@]}" -X -q -v ON_ERROR_STOP=1 -P footer=off "$@"; }
since="created_at > NOW() - INTERVAL '$DAYS days'"

# Retención: las señales viejas no aportan y crecen sin límite.
q -c "DELETE FROM product_events WHERE created_at < NOW() - INTERVAL '180 days'" >/dev/null

total=$(q -tA -c "SELECT count(*) FROM product_events WHERE $since")
if [ "$total" = "0" ]; then
  echo "NO_EVENTS"
  exit 0
fi

section() {
  printf '\n## %s\n\n```text\n' "$1"
  q -c "$2"
  printf '```\n'
}

echo "# Señales de producto: últimos $DAYS días"
echo
echo "Eventos registrados: **$total**."

section "Imports fallidos por host y motivo" \
  "SELECT detail->>'host' AS host, detail->>'reason' AS motivo, count(*) AS n
     FROM product_events WHERE kind = 'import_failed' AND $since
    GROUP BY 1, 2 ORDER BY n DESC LIMIT 15"

section "Páginas permitidas donde el parser no encontró cifrado" \
  "SELECT detail->>'host' AS host, detail->>'path' AS path, count(*) AS n
     FROM product_events WHERE kind = 'import_failed' AND detail->>'reason' = 'no_content' AND $since
    GROUP BY 1, 2 ORDER BY n DESC LIMIT 10"

section "Búsquedas sin resultados (3+ veces)" \
  "SELECT detail->>'q' AS busqueda, count(*) AS n
     FROM product_events WHERE kind = 'search_empty' AND $since
    GROUP BY 1 HAVING count(*) >= 3 ORDER BY n DESC LIMIT 20"

section "Cifrados corregidos por su autor (calidad de IA / imports)" \
  "SELECT detail->>'from' AS origen, COALESCE(detail->>'model', '-') AS modelo, COALESCE(detail->>'source', '-') AS fuente, count(*) AS n
     FROM product_events WHERE kind = 'chords_edited' AND $since
    GROUP BY 1, 2, 3 ORDER BY n DESC"

section "Errores generando con IA" \
  "SELECT detail->>'model' AS modelo, left(detail->>'reason', 80) AS motivo, count(*) AS n
     FROM product_events WHERE kind = 'ai_failed' AND $since
    GROUP BY 1, 2 ORDER BY n DESC LIMIT 10"

section "Cifrados por origen (acumulado)" \
  "SELECT COALESCE(origin, '(previo)') AS origen, count(*) AS n FROM chord_cache GROUP BY 1 ORDER BY n DESC"

cat <<'MD'

---
**Para el agente que tome este issue:** elegí como máximo 2 problemas con más impacto (más `n`), y abrí un PR por cada uno con un test de regresión.
- Un host pedido seguido que no está en la allowlist: proponer sumarlo (parser + test con fixture sintética).
- Páginas sin cifrado: el parser de esa fuente cambió; arreglarlo.
- Búsquedas sin resultados repetidas: candidatas para `scripts/import-bulk.mjs`.
- Muchos cifrados de IA corregidos: revisar el prompt o el modelo en `backend/src/services/aiService.ts`.
MD
