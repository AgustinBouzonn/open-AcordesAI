## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Denial of Service via Storage Quotas and Malformed Data
**Vulnerability:** Direct usage of `JSON.parse` on `localStorage` data and unchecked `localStorage.setItem` calls caused application crashes when data was malformed or storage quota was exceeded.
**Learning:** Client-side storage is an external input source and must be treated as untrusted. Browsers throw errors (like `QuotaExceededError`) that must be caught to prevent the entire SPA from crashing.
**Prevention:** Wrap all storage operations in safe utility functions (`safeJSONParse`, `safeSetItem`) that handle exceptions gracefully and return fallback values.
