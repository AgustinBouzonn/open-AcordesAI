## 2024-07-08 - String parsing overhead
**Learning:** Codebases with heavy string parsing (like chord transposing) suffer from hidden O(N) array allocation overheads via `.split()` and `.filter()`.
**Action:** Replace high-frequency array-based string processing with manual indexing and tokenization.
