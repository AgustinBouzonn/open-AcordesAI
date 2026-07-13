## 2024-07-13 - LATERAL JOIN Optimization
**Learning:** Use LEFT JOIN LATERAL instead of correlated subqueries in SELECT clauses to prevent N+1 issues and preserve index usage.
**Action:** Use LATERAL joins for row-specific subquery aggregation.
