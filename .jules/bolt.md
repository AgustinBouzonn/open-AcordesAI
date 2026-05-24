## 2024-05-24 - Avoiding Object.fromEntries for serialization
**Learning:** In hot paths like serializers, using `Object.fromEntries(Object.entries({...}).filter(...))` introduces significant overhead by creating intermediate objects and arrays.
**Action:** Replace `Object.fromEntries` pattern with manual object construction and conditional assignments (`if (val !== undefined) result.key = val;`) to improve performance.
