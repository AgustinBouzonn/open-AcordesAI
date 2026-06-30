## 2025-06-30 - Optimize song serialization performance
**Learning:** `Object.fromEntries(Object.entries(...).filter(...))` can be a hidden bottleneck when mapping over large arrays (like database query results) because it creates numerous intermediate objects and arrays.
**Action:** Use manual object construction and conditional assignment (`if (val != null) res.prop = val`) for frequently called serializers or mappers to avoid unnecessary memory allocation and speed up execution.
