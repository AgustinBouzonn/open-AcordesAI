## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Local Storage DoS via Unbounded Input
**Vulnerability:** User comments lacked length validation in both UI and service layers, allowing massive strings to be stored in `localStorage`, potentially causing QuotaExceededError and crashing the application (DoS).
**Learning:** Client-side storage (localStorage/IndexedDB) has strict quotas. Unbounded user input stored locally is a trivial DoS vector that can render the app unusable for the victim.
**Prevention:** Enforce strict length limits on all user input before storage. Use `maxLength` attributes for UX and sanitize/truncate in the data layer for security.
