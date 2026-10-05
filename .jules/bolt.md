
## 2026-10-05 - Avoid N+1 Subqueries with LEFT JOIN LATERAL
**Learning:** Correlated subqueries in a SELECT list (like `(SELECT COUNT(*) FROM table WHERE id = x.id)`) combined with a LIMIT evaluate the subqueries for *every* matched row *before* limiting, causing massive performance regressions on text-based searches.
**Action:** Isolate the driving table and its filtering/ordering into an inner subquery with the LIMIT first. Then, apply `LEFT JOIN LATERAL` on the paginated results for any necessary aggregates to preserve performance and filter conditions.
