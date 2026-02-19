## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-13 - LocalStorage Quota DoS
**Vulnerability:** Uncaught `QuotaExceededError` in `localStorage.setItem` caused application crashes when storage was full.
**Learning:** Browser storage APIs are not infinite and not fault-tolerant. Uncaught exceptions in storage operations can break the UI thread, causing a denial of service.
**Prevention:** Wrap all `localStorage` and `JSON.parse` operations in try-catch blocks using helper functions like `safeSetItem`.
