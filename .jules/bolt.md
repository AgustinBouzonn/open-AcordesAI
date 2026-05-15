## 2024-05-15 - Optimize serializer object creation
**Learning:** Using `Object.fromEntries(Object.entries({...}).filter(...))` in serializers creates significant allocation overhead due to intermediate objects and arrays.
**Action:** Replace this pattern with manual object construction and conditional property assignments to improve performance.
