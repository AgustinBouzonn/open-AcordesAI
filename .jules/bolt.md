## 2026-06-17 - [Optimize Song Serializer]
**Learning:** Object.fromEntries(Object.entries(...).filter(...)) is highly inefficient for data serialization compared to manual object construction.
**Action:** Use manual object construction when serializing rows, especially in hot paths.
