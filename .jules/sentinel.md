## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-27 - LocalStorage DoS and Fragility
**Vulnerability:** Direct usage of `JSON.parse` on `localStorage` items caused application crashes when data was malformed. Additionally, `localStorage.setItem` lacked error handling for `QuotaExceededError`, allowing potential DoS if storage filled up.
**Learning:** Client-side storage is "untrusted input". Users or malicious scripts can modify it. Also, storage is finite; failing to handle quota errors leads to uncaught exceptions that break the UI.
**Prevention:** Always use a safe wrapper for `JSON.parse` (returning a fallback) and wrap `localStorage.setItem` in a try-catch block to handle quota limits gracefully.
