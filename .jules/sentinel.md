## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Resilient Storage (DoS Protection)
**Vulnerability:** Direct use of `JSON.parse()` on `localStorage` data caused application crashes when data was malformed (e.g. manual edit) or when `setItem` exceeded quotas (`QuotaExceededError`), leading to a Denial of Service.
**Learning:** Client-side storage is an "external" input source and must be treated with the same distrust as network responses. It can be corrupted or full.
**Prevention:** Wrapped all storage operations in `safeJSONParse` and `safeSetItem` utility functions to handle parsing errors and quota limits gracefully without crashing the main thread.
