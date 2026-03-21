## 2024-03-20 - [Memory Profiling]
**Learning:** Found an anti-pattern of using `.map().filter(Boolean)` on storage lookups which allocates intermediate arrays unnecessarily, reducing memory and CPU efficiency.
**Action:** Use `.reduce()` instead to filter and map in a single pass.
