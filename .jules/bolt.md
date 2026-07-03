## 2024-05-24 - Avoid Object.fromEntries for stripping undefined values
**Learning:** Using `Object.fromEntries(Object.entries(...).filter(...))` to strip undefined values creates multiple intermediate arrays, significantly degrading serialization performance, especially for large lists of objects.
**Action:** Use manual object construction and conditional assignment (`!= null`) to build response objects efficiently when properties are conditionally included.
