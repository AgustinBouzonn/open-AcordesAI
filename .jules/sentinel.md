## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Client-Side Storage DoS
**Vulnerability:** Unbounded `localStorage` writes and lack of error handling allowed for potential DoS via quota exhaustion (QuotaExceededError).
**Learning:** Frontend storage APIs (localStorage, sessionStorage) are synchronous and have hard limits (~5MB). Failing to catch write errors can crash the application or freeze the main thread.
**Prevention:** Always wrap storage writes in `try-catch` blocks and enforce strict length limits on user-generated content stored locally.
