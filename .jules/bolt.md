## 2026-09-25 - Avoid N+1 Subqueries Before Pagination
**Learning:** Correlated subqueries in the `SELECT` clause (like `(SELECT COUNT(*) FROM table WHERE id = main.id)`) are evaluated for *every matched row* before `LIMIT` is applied, causing massive performance regressions on paginated queries.
**Action:** When querying paginated data with aggregate counts, extract the base paginated query into a derived table subquery (with `ORDER BY` and `LIMIT`) first, and then apply `LEFT JOIN LATERAL` onto the limited result set.
