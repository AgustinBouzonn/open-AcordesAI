## 2024-05-28 - Optimize serializeSong function
**Learning:** Using `Object.fromEntries(Object.entries({ ... }).filter(...))` in data serializers introduces significant allocation overhead from creating intermediate objects and arrays, especially for large datasets.
**Action:** Replace `Object.fromEntries` patterns with manual object construction and conditional property assignments (`if (val !== undefined) obj.key = val`) to eliminate allocation overhead in performance-critical paths like data serializers.
