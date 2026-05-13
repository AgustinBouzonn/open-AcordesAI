## 2024-05-13 - Serialize performance
**Learning:** `Object.fromEntries(Object.entries({...}).filter(...))` pattern has high memory overhead for intermediate objects and arrays when used in hot paths like serialization.
**Action:** Replace with manual object construction and conditional assignments (`if (value !== undefined) obj.key = value`) to improve performance and avoid regression.
