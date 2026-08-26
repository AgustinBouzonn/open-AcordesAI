## 2023-10-25 - PostgreSQL Correlated Subqueries vs LATERAL Joins
**Learning:** Using `LEFT JOIN LATERAL` instead of correlated subqueries in `SELECT` clauses resolves N+1 query execution bottlenecks while still preserving index usage and filter pushdown, provided the `ORDER BY` clause does not depend on the aggregates.
**Action:** Replace correlated subqueries in `SELECT` with `LEFT JOIN LATERAL` when sorting does not depend on the aggregated columns.
