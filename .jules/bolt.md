## 2025-04-02 - Eliminate array allocations in search accumulation
**Learning:** Combining multiple array operations (`.map`, `.filter`, and array spreading) generates unnecessary intermediate array allocations, putting pressure on memory and garbage collection in hot paths like search processing.
**Action:** Replace chained array operations with a single-pass accumulation loop (or `.reduce`) directly building the target result shape.
