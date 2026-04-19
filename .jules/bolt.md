## 2024-05-18 - [Eliminate Allocation Overhead in Serializers]
**Learning:** In performance-critical paths like data serializers that iterate over multiple rows (e.g., `backend/src/serializers/song.ts`), the pattern `Object.fromEntries(Object.entries({...}).filter(...))` introduces significant memory allocation overhead due to the creation of intermediate objects and arrays.
**Action:** Replace intermediate array constructions with manual object definitions and conditional assignments to directly construct objects, thereby reducing memory overhead and improving throughput.
