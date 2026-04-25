## 2024-05-20 - [Avoid Object.fromEntries for Object Filtering in Performance Paths]
**Learning:** [Using `Object.fromEntries(Object.entries({...}).filter(...))` in hot paths like data serializers creates unnecessary intermediate objects and arrays, causing significant allocation overhead and slowing down performance.]
**Action:** [In performance-critical code, replace the filter pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate allocation overhead.]
