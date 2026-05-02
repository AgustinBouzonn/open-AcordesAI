## 2025-05-01 - Avoid Object.fromEntries for Critical Serializers
**Learning:** Using `Object.fromEntries(Object.entries({...}).filter(...))` inside performance-critical data paths like serializers creates unnecessary array allocations and iteration overhead, leading to slower performance compared to manual object construction with conditional checks.
**Action:** Replace this pattern with explicit object construction (e.g., `const result: Record<string, unknown> = {}; if (row.key !== undefined) result.key = row.key;`) to eliminate intermediate objects and array processing.
