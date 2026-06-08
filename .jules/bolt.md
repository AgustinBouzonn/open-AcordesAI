## 2025-06-08 - Object.entries/fromEntries performance pitfall
**Learning:** In hot serialization paths (like mapping rows to API payloads), `Object.fromEntries(Object.entries(obj).filter(...))` creates significant memory allocation overhead due to intermediate array creation. This results in slow serialization, particularly when serializing arrays of records.
**Action:** Use manual object construction and check properties explicitly with `!= null` rather than using higher-order object functions in frequently executed serializers.
