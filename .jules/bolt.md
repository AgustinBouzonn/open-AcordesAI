## 2024-06-25 - Avoid Object.fromEntries for Data Serializers
**Learning:** Using `Object.fromEntries(Object.entries({...}).filter(...))` inside data serializers (like `serializeSong`) creates significant performance overhead due to the allocation of intermediate objects and arrays on every row processed.
**Action:** Replace this pattern with manual object construction and conditional property assignments (`if (val !== undefined) obj.key = val`) to eliminate the intermediate allocations and improve serialization performance.
