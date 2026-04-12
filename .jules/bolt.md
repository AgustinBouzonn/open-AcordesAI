## 2024-04-12 - Replacing correlated subqueries with LEFT JOIN LATERAL in PostgreSQL
**Learning:** Correlated subqueries in SELECT lists execute per-row and repeat aggregations unnecessarily, creating N+1-like performance bottlenecks in PostgreSQL backends.
**Action:** Always replace correlated subqueries in SELECT and ORDER BY lists with LEFT JOIN LATERAL subqueries to consolidate multiple separate aggregations (like AVG and COUNT on the same table) into a single scan per row, significantly reducing query overhead.
