## 2024-04-24 - Serializer Object Allocation Overhead
**Learning:** The pattern `Object.fromEntries(Object.entries({...}).filter(...))` introduces significant memory allocation overhead by creating intermediate objects and arrays, which becomes a bottleneck in list serializers for large datasets.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) in performance-critical paths like serializers to eliminate these intermediate allocations.
