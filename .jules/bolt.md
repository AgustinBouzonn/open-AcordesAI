## 2026-08-29 - Consolidate Correlated Subqueries
**Learning:** Postgres N+1 correlated subqueries in SELECT clauses (e.g., retrieving counts and averages for songs) can be consolidated into a single `LEFT JOIN LATERAL` per table, which prevents redundant index lookups per row and avoids severe performance degradations on listing endpoints.
**Action:** Always refactor multiple correlated aggregate subqueries on the same target table into a single `LEFT JOIN LATERAL` subquery when optimizing listing queries.
