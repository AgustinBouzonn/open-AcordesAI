## 2024-05-08 - Eliminate Object.fromEntries allocation overhead in serializers
**Learning:** Using `Object.fromEntries(Object.entries({...}).filter(...))` in data serializers (like `backend/src/serializers/song.ts`) causes significant allocation overhead of intermediate objects and arrays, especially when processing large datasets or frequent API requests.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate the intermediate allocations and improve performance in critical paths.
