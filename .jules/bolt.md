## 2024-05-19 - Reduce Garbage Collection overhead in array operations
**Learning:** Combining multiple array operations (`.map`, `.filter`, and array spreading) generates unnecessary intermediate array allocations, which increases memory and garbage collection overhead in hot paths like search processing.
**Action:** Replace chained array operations with a single pass accumulation (e.g., using a single `for` loop or `.reduce`) to improve memory efficiency and lower allocation overhead.
