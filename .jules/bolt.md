## 2026-06-01 - Optimize Data Serializers
**Learning:** The pattern `Object.fromEntries(Object.entries({...}).filter(...))` is extremely slow in critical paths (like data serializers) due to multiple allocations of objects and arrays.
**Action:** Replace `Object.fromEntries` pattern with manual object construction and conditional property assignment (e.g., `if (val != null) result.key = val;`) to improve serialization performance significantly.
