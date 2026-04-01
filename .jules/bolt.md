## 2024-05-15 - [Optimize Array Operations]
**Learning:** Combining multiple array operations (`.map`, `.filter`, and array spreading) generates unnecessary intermediate array allocations. In hot paths like search processing, replace chained array operations with a single pass accumulation (e.g., using a single loop or `.reduce`) to reduce memory and garbage collection overhead.
**Action:** Use a single loop to accumulate local and iTunes results in `performSearch` to avoid intermediate array creation.
