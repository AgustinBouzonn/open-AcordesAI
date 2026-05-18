## 2024-05-24 - Optimize serializeSong by eliminating intermediate objects
**Learning:** In performance-critical paths like data serializers (e.g., `backend/src/serializers/song.ts`), the `Object.fromEntries(Object.entries({...}).filter(...))` pattern introduces significant allocation overhead from intermediate objects and arrays.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate the overhead.
