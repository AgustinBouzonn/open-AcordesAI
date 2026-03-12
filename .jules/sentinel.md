## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - LocalStorage Denial of Service (DoS) via Unbounded Inputs
**Vulnerability:** User-generated comments were saved directly to localStorage without length limits. A malicious user could submit extremely large strings, rapidly exhausting the browser's 5MB localStorage quota and crashing or bricking the application state.
**Learning:** Client-side storage is a shared, limited resource. Treating it like an infinite database without validating data size creates an easy vector for DoS attacks that require manual intervention (clearing site data) to fix.
**Prevention:** Always enforce strict length limits on user inputs (e.g., `maxLength={500}`) both on the client UI and in the storage/service layer before saving data to localStorage.
