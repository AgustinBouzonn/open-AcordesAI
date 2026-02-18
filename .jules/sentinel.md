## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Client-Side Denial of Service via LocalStorage Quota
**Vulnerability:** Uncaught `QuotaExceededError` in `localStorage.setItem` caused application crashes when storage was full, rendering the PWA unusable.
**Learning:** Browser storage APIs (LocalStorage, IndexedDB) have strict quotas and throw exceptions when exceeded. Without error handling, this becomes a trivial DoS vector.
**Prevention:** Wrap all storage write operations in try-catch blocks (`safeSetItem`) to degrade gracefully (e.g., disable caching) rather than crashing the application.
