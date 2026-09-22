## 2024-03-22 - Replacing Postgres Correlated Scalar Subqueries with LATERAL Joins
**Learning:** Using multiple correlated scalar subqueries in a SELECT clause (like `(SELECT AVG(score)...)` and `(SELECT COUNT(*)...)`) targeting the same table creates N+1 query issues where Postgres scans the index multiple times per row.
**Action:** Consolidate aggregate calculations targeting the same related table into a single `LEFT JOIN LATERAL (...) ON true` to fetch all aggregates in one pass, drastically reducing I/O and query time.
