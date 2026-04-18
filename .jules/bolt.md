## 2024-05-15 - [Object allocation bottleneck in serializers]
**Learning:** Using `Object.fromEntries(Object.entries({...}).filter(...))` pattern in serializers causes significant performance degradation due to unnecessary object, array, and intermediate array allocations (especially for every row in a database response).
**Action:** Replace functional array/object manipulation patterns in critical serialization paths with manual object construction and simple `if (value !== undefined)` checks to eliminate overhead (~40x performance improvement).
