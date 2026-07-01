## 2025-02-23 - Avoid Object.fromEntries(Object.entries(...).filter(...))
**Learning:** Using `Object.fromEntries(Object.entries(obj).filter(...))` to prune `undefined` properties creates significant overhead in hot paths (like database serializers) because it allocates temporary arrays and closures for every row.
**Action:** Use manual conditional property assignment (e.g., `if (val != null) result.key = val;`) to build the response object, significantly reducing garbage collection pressure and serialization time.
