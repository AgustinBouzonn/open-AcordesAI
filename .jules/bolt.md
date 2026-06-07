## $(date +%Y-%m-%d) - Prevent N+1 queries in User Backup Import
**Learning:** The backup import route (`/api/auth/import`) was processing arrays of favorites, ratings, and setlist songs one by one, leading to potential N+1 query problems. A backup could have thousands of records, which would result in thousands of individual `INSERT` queries and significant backend blocking.
**Action:** Used `unnest` for parallel bulk insertions/upserts via `pg`'s built-in array support (`Number[]`), allowing entire arrays to be processed in a single query.
