## 2026-10-03 - Optimize Subqueries with LEFT JOIN LATERAL
**Learning:** The database execution planner may evaluate correlated scalar subqueries in `SELECT` lists before applying top-level sorting and pagination (`LIMIT`). This causes major performance regressions by doing full aggregation scans for thousands of rows before picking out 50.
**Action:** When evaluating correlated aggregate metrics on endpoints with `LIMIT` / `OFFSET`, move the base query (with `ORDER BY` and `LIMIT`) into a subquery, and apply `LEFT JOIN LATERAL` onto the constrained base results.
