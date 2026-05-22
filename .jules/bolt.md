## 2024-05-22 - Replacing Object.fromEntries allocation overhead
**Learning:** In performance-critical paths like data serializers (e.g., `backend/src/serializers/song.ts`), the `Object.fromEntries(Object.entries({...}).filter(...))` pattern causes significant allocation overhead from intermediate objects and arrays.
**Action:** Replace it with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate the overhead, ensuring all properties are conditionally assigned.
