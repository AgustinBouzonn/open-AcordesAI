## 2024-05-24 - Bulk Inserts with PostgreSQL `unnest`
**Learning:** Performing single `INSERT` queries inside a loop (N+1 query problem) during data imports (e.g., user favorites, ratings, and setlist songs) creates a massive performance bottleneck.
**Action:** Use PostgreSQL's `unnest` function to pass arrays of data as query parameters (e.g., `SELECT unnest($1::int[])`) and perform a single bulk insert, dramatically reducing round trips to the database.
