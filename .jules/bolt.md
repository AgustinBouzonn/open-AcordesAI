## $(date +%Y-%m-%d) - Backend N+1 Subquery Optimization
**Learning:** Found N+1 query patterns in `SELECT` clauses using correlated subqueries in `backend/src/routes/songs.ts` (e.g., fetching ratings and chords counts).
**Action:** Replaced with `LEFT JOIN LATERAL` to fix the N+1 problem and avoid full table scans, keeping index usage and filter condition pushdown.
