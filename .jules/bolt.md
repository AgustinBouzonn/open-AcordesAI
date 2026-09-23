## 2026-09-23 - Optimize Postgres Correlated Subqueries with LATERAL Joins
**Learning:** In PostgreSQL, refactoring correlated scalar subqueries in SELECT clauses into a LEFT JOIN LATERAL allows you to consolidate multiple aggregates querying the same target table (e.g. AVG(score) and COUNT(*)) into one subquery execution per row.
**Action:** Always prefer consolidating multiple related aggregations on the same child table into a LEFT JOIN LATERAL over using multiple correlated scalar subqueries, but be cautious with fully-aggregated subqueries on unconstrained results with LIMITs.
