## 2024-05-02 - Eliminate Object.fromEntries(Object.entries(...).filter(...)) for Serializers
**Learning:** The `Object.fromEntries(Object.entries({...}).filter(...))` pattern in data serializers creates significant intermediate object and array allocation overhead, especially on performance-critical paths returning many rows.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined && val !== null) obj.key = val`) to optimize serialization.
