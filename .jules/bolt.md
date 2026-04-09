## 2024-04-04 - [Optimize Array Allocations]
**Learning:** Combining multiple array operations (`.map`, `.filter`, and array spreading) in a single code block generates unnecessary intermediate array allocations, increasing garbage collection and memory overhead, especially in hot paths like search processing.
**Action:** Replace chained array operations with a single-pass accumulation (using `for` loop or `.reduce`) to reduce memory and GC overhead.
