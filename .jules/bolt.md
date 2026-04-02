## 2024-04-02 - [Eliminate intermediate array allocations in search path]
**Learning:** Combining multiple array operations (`.map`, `.filter`, and array spreading) generates unnecessary intermediate array allocations. In hot paths like search processing, this increases memory overhead and garbage collection pauses.
**Action:** Replace chained array operations with a single pass accumulation (e.g., using a single loop or `.reduce`) to reduce memory and garbage collection overhead.
