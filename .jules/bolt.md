## 2024-08-18 - Resolving PostgreSQL N+1 and Full Table Scans with LATERAL Joins
**Learning:** The application was using correlated subqueries in SELECT clauses (causing N+1 executions) and fully aggregated subqueries in standard LEFT JOINs (causing full table scans on large tables).
**Action:** Use `LEFT JOIN LATERAL` (or `JOIN LATERAL` with `ON cnt > 0` for inner joins) to preserve index usage and filter condition pushdown for specific rows queried without causing full table scans.
