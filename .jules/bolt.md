## 2023-10-27 - [Optimize performSearch to reduce array allocations]
**Learning:** Combining multiple array operations (`.map`, `.filter`, and array spreading) generates unnecessary intermediate array allocations. In hot paths like search processing, chained array operations can cause memory and garbage collection overhead.
**Action:** Replace chained array operations with a single pass accumulation (e.g., using a single loop or `.reduce`) to reduce memory and garbage collection overhead.
