## 2024-05-17 - [Initial]
## 2026-03-27 - [Optimize Song Retrieval Array Operations]
**Learning:** Using `.map().filter(Boolean)` on large cached collections like `favorites` or `history` creates unnecessary intermediate array allocations and causes redundant iteration passes, negatively impacting performance.
**Action:** Replace two-pass array operations (`.map().filter()`) with a single `.reduce()` pass in `getFavoriteSongsFull` and `getHistorySongsFull` to eliminate intermediate allocations and reduce iteration overhead.
