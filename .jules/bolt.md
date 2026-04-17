## 2026-04-17 - Optimize SQL aggregations with LEFT JOIN LATERAL
**Learning:** To optimize SQL performance in the PostgreSQL backend, replace correlated subqueries in SELECT and ORDER BY lists with LEFT JOIN LATERAL subqueries. While LATERAL joins still execute per-row, this approach consolidates multiple separate aggregations (like AVG and COUNT on the same table) into a single scan per row, significantly reducing overhead.
**Action:** Use LEFT JOIN LATERAL for aggregating related data when dealing with multiple aggregations from the same or related tables in PostgreSQL.
