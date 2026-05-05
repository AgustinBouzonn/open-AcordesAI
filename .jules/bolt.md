## 2024-05-24 - [Optimize song serializer to avoid Object.fromEntries allocation overhead]
**Learning:** [Replacing `Object.fromEntries(Object.entries({...}).filter(...))` with manual object construction and conditional property assignments removes the significant allocation overhead of intermediate objects and arrays.]
**Action:** [In performance-critical paths like data serializers, utilize manual object construction to avoid allocating intermediate arrays when conditional properties are evaluated.]
