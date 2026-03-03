## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Local Storage Exhaustion (DoS) via Unbounded Inputs
**Vulnerability:** The comments section allowed users to submit arbitrarily large strings, which were then saved to `localStorage`. A malicious user could paste a multi-megabyte string, exhausting the 5MB browser storage limit and crashing the application's ability to save state.
**Learning:** Client-side storage is finite and easily exhaustible. UI constraints (like `maxLength` on a textarea) are easily bypassed by modifying the DOM or using developer tools.
**Prevention:** Implement defense-in-depth: add UI constraints (`maxLength`) for UX, AND enforce strict data-layer truncation/sanitization (`text.slice(0, MAX_LENGTH)`) before writing to `localStorage`.
