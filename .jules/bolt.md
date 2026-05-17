## 2024-05-17 - Serialize performance bottleneck
**Learning:** The `Object.fromEntries(Object.entries(...).filter(...))` pattern is a significant performance bottleneck in hot paths like data serializers due to the allocation overhead of intermediate objects and arrays.
**Action:** Replace this pattern with manual object construction and conditional property assignments (e.g., `if (val !== undefined) obj.key = val`) to eliminate the overhead, ensuring all properties (including base ones) are assigned conditionally to avoid undefined keys.
