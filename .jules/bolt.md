## 2024-10-24 - PostgreSQL LATERAL JOIN Optimization
**Learning:** Correlated subqueries in SELECT clauses and fully aggregated LEFT JOINs cause Postgres to perform full table scans before joining, leading to N+1 performance bottlenecks on list endpoints.
**Action:** Use LEFT JOIN LATERAL (SELECT ... WHERE song_id = s.id) ON true to push down the filter condition, allowing Postgres to use indexes for each row instead of scanning the whole table.
