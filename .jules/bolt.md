## 2024-06-13 - Eliminate Object.fromEntries(Object.entries(...).filter(...)) in serializers
**Learning:** The pattern `Object.fromEntries(Object.entries({...}).filter(...))` causes significant allocation overhead by creating intermediate objects and arrays, slowing down performance-critical paths like data serializers.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to drastically improve performance and reduce memory allocations.
