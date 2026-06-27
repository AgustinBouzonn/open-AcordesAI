## 2025-02-27 - Manual object construction outperforms Object.fromEntries for serialization
**Learning:** Using `Object.fromEntries(Object.entries(...).filter(...))` for data serialization is significantly slower due to intermediate array allocations and iterations. In this codebase, it creates a major performance bottleneck for large data sets like songs.
**Action:** Always prefer manual object construction with conditional property assignment (`!= null`) when implementing performance-critical serializers.
