## 2025-02-18 - [Eliminate intermediate object/array allocations in hot paths]
**Learning:** In performance-critical paths like data serializers, using `Object.fromEntries(Object.entries({...}).filter(...))` causes significant allocation overhead of intermediate objects and arrays.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to improve performance.
