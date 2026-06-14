## $(date +%Y-%m-%d) - Optimize Bulk Data Imports
**Learning:** In PostgreSQL, the `ON CONFLICT DO UPDATE` clause throws a fatal error ("ON CONFLICT DO UPDATE command cannot affect row a second time") if a single bulk `INSERT ... SELECT unnest(...)` statement contains duplicate conflicting keys (e.g., the same `songId` twice when updating ratings).
**Action:** When refactoring sequential loops into bulk `UNNEST` queries, always pre-process and deduplicate the array in memory first (e.g., using `new Map()` or `new Set()`) to ensure each bulk operation contains strictly unique keys.
