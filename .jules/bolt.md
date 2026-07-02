## 2025-03-09 - Optimize object serialization
**Learning:** Object.fromEntries(Object.entries(...).filter(...)) pattern in serializers causes excessive array allocations for every database row mapped.
**Action:** Replace with manual object construction and conditional assignment using != null check.
