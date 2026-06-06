## 2025-06-06 - Optimized Song Serialization

**Learning:** `Object.fromEntries(Object.entries(...).filter(...))` is heavily used for serializing songs to remove `undefined` or `null` values. This pattern allocates an intermediate array for the object entries and another array during `.filter()`, which results in unnecessary O(n) memory and time overhead, especially noticeable when querying and serializing large lists of songs (e.g. `GET /api/songs`).

**Action:** Replace `Object.fromEntries` pattern with manual object construction, checking for `!= null` to skip adding undefined properties directly. Use this approach for high-throughput serializers where avoiding temporary allocations matters.
