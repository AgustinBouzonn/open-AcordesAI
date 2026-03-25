## 2024-05-24 - [Optimize Array Iteration in LocalStorage Reads]
**Learning:** Found an unnecessary intermediate array allocation using `.map(id => cache[id]).filter(Boolean)` in `getFavoriteSongsFull` and `getHistorySongsFull` which increases memory pressure and iteration overhead during component re-renders that read from storage.
**Action:** Always replace `.map().filter(Boolean)` patterns with a single `.reduce()` pass when transforming arrays and filtering out undefined/null values simultaneously to eliminate the intermediate array and reduce iteration count to one.
