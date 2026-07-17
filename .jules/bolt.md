## 2025-03-09 - N+1 Correlated Subqueries
**Learning:** In PostgreSQL, executing queries with multiple N+1 correlated subqueries inside the SELECT clause (e.g. `(SELECT COUNT(*) FROM ratings WHERE song_id = s.id)`) can result in degraded performance as the table scales, as Postgres often scans the inner tables for every row.
**Action:** Replace correlated scalar subqueries in the SELECT clause with `LEFT JOIN LATERAL (...) ON true` to allow better pushdown and optimization when returning multiple rows from the main query.
