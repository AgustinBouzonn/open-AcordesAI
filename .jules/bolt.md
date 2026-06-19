## $(date +%Y-%m-%d) - Object Serialization Performance
**Learning:** Using `Object.fromEntries(Object.entries(...).filter(...))` on every request in a hot path (like serializing a list of songs from the database) creates excessive short-lived objects and arrays, causing significant memory allocation and garbage collection overhead.
**Action:** When mapping database rows to DTOs in high-throughput endpoints, construct objects manually and conditionally assign optional properties instead of relying on functional array methods over object entries.
