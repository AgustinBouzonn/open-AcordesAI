## 2024-05-14 - [Optimize Array Allocations]
**Learning:** Combining multiple array operations (`.map` and array spreading) generates unnecessary intermediate array allocations, which can cause garbage collection overhead and reduce performance in hot paths like search processing.
**Action:** Replace chained array operations with a single pass accumulation (e.g., using a single loop or `Array.prototype.push.apply`) to reduce memory and garbage collection overhead.

## 2024-05-14 - [Optimize Correlated Subqueries]
**Learning:** Using multiple correlated subqueries in the SELECT and ORDER BY lists for aggregations (like COUNT, AVG) on the same tables causes N+1 execution overhead per row, as the database must perform separate scans for each aggregation.
**Action:** Consolidate multiple separate aggregations into a single scan per row by replacing correlated subqueries with `LEFT JOIN LATERAL` queries. While LATERAL joins still execute per-row, they compute all necessary aggregations for that row in one pass, significantly reducing overall execution time and database load.
