## 2025-05-18 - Optimize slow object filtering in serializers
**Learning:** In performance-critical paths like data serializers, the `Object.fromEntries(Object.entries({...}).filter(...))` pattern has significant allocation overhead because it creates intermediate objects and arrays.
**Action:** Replace `Object.fromEntries(Object.entries({...}).filter(...))` with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate the overhead, making the serialization much faster.
