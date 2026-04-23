## 2026-04-11 - Optimize Postgres correlated subqueries with LATERAL joins
**Learning:** Correlated subqueries in SELECT clauses run independently for each aggregated column (e.g., AVG, COUNT) per row, causing multiple table scans and poor performance on lists.
**Action:** Replace multiple correlated subqueries on the same target table with a single `LEFT JOIN LATERAL` to compute all aggregations (like `AVG(score)` and `COUNT(*)`) in one pass per row, then access them via the alias.
