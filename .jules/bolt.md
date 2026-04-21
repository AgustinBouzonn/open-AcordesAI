## 2024-05-24 - [Avoid Object.fromEntries allocation overhead in serializers]
**Learning:** Using the `Object.fromEntries(Object.entries({...}).filter(...))` pattern in data serializers (like `backend/src/serializers/song.ts`) introduces significant allocation overhead of intermediate arrays and objects in performance-critical paths.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate the significant allocation overhead.
