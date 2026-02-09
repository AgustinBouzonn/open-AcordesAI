## 2025-05-23 - Storage Service JSON Parsing Bottleneck
**Learning:** `localStorage` access via `JSON.parse` for large objects (like the song cache) is extremely expensive and blocks the main thread. Accessing this data inside render loops (e.g. `getFavoriteSongsFull`) causes significant jank.
**Action:** Always implement an in-memory cache layer for `localStorage` data that is accessed frequently. Use `storage` event listeners to maintain cross-tab consistency if needed.
