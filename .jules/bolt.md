## 2024-04-02 - [Avoid Chained Array Operations in Hot Paths]
**Learning:** Combining multiple array operations (`.map()`, `.filter()`, and array spreading `[...]`) in frequently executed paths (like search processing) creates unnecessary intermediate array allocations, increasing memory usage and garbage collection overhead.
**Action:** Replace chained array operations with a single-pass accumulation (e.g., using `for` loops or `.reduce()`) to perform all mapping and filtering simultaneously without generating intermediate arrays.
