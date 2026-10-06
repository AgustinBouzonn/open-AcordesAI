## 2026-10-06 - Optimize Paginated N+1 Subqueries using LEFT JOIN LATERAL
**Learning:** Correlated subqueries inside the SELECT clause of a paginated query are evaluated repeatedly in a nested loop pattern on the outer query, even with limits.
**Action:** Consolidate the base query with WHERE, ORDER BY, and LIMIT in a derived table first, and then attach multiple aggregates to the constrained paginated results using LEFT JOIN LATERAL. Avoid doing LATERAL JOINs directly in the main query block before LIMIT to prevent evaluating the join for all matching unpaginated rows.
