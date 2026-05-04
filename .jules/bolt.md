## 2026-05-04 - Optimize object serialization

**Learning:** `Object.fromEntries(Object.entries({ ... }).filter(...))` creates significant intermediate object and array allocations that drastically hurt performance in tight loops or high-throughput serialization paths.

**Action:** Replace this pattern with manual object construction and conditional property assignments (`if (value !== undefined) obj.key = value`) to avoid these unnecessary allocations and boost serialization speed significantly.