## 2025-04-16 - Optimize SQL aggregations with LEFT JOIN LATERAL
**Learning:** Correlated subqueries in SELECT lists (like `(SELECT COUNT(*) FROM table WHERE id = main.id)`) can cause performance bottlenecks in PostgreSQL due to repeated scanning. Replacing them with `LEFT JOIN LATERAL` can significantly improve performance by consolidating multiple aggregations into a single row scan.
**Action:** Use `LEFT JOIN LATERAL` when calculating multiple aggregate metrics on related tables for a single row.
