## 2024-05-19 - [Eliminate intermediate array allocations]
**Learning:** Using chained `.map().filter()` when retrieving lists of objects from a cache introduces unnecessary intermediate array allocations and O(n) multiple passes over the dataset.
**Action:** Always replace `.map().filter(Boolean)` with a single `.reduce()` pass to construct the final array, directly eliminating iteration overhead and intermediate array garbage collection.
