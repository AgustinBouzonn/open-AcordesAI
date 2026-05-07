## 2024-05-07 - Avoid Object.fromEntries for data serializers
**Learning:** Using `Object.fromEntries(Object.entries(...).filter(...))` in data serializers introduces significant allocation overhead from creating intermediate arrays and objects, particularly on hot paths like bulk data serialization.
**Action:** Replace the `Object.fromEntries` pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to optimize performance and reduce memory allocations.
