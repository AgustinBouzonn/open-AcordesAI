## 2026-05-31 - Avoiding Object.fromEntries overhead in serializers
**Learning:** `Object.fromEntries(Object.entries({...}).filter(...))` causes significant allocation overhead of intermediate objects and arrays in performance-critical paths like data serializers.
**Action:** Replace it with manual object construction and conditional property assignments (e.g. `if (val != null) obj.key = val`) to eliminate the overhead. Use loose inequality (`!= null`) to ensure null values aren't unintentionally serialized when the original code coerced `null` to `undefined`.
