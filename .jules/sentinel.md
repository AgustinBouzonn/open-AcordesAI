## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - LocalStorage DoS & Crash
**Vulnerability:** Direct usage of `JSON.parse(localStorage.getItem(...))` and `localStorage.setItem(...)` without error handling caused application crashes (DoS) when storage was malformed or quota was exceeded.
**Learning:** `localStorage` is an external, untrusted input source. Data can be corrupted by users or extensions. Writing to it can fail synchronously.
**Prevention:** Always wrap `JSON.parse` and `localStorage.setItem` in try-catch blocks. Use helper functions like `safeJSONParse` and `safeSetItem`.
