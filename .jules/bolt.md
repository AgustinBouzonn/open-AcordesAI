## 2024-05-24 - [Optimize array iteration in storageService.ts]
**Learning:** Chaining `.map().filter(Boolean)` in data retrieval functions creates unnecessary intermediate array allocations and causes multiple iteration passes.
**Action:** Replace these patterns with a single `.reduce()` pass for memory efficiency and better performance when scaling large lists like `getFavoriteSongsFull` and `getHistorySongsFull`.
