## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2023-10-27 - Unhandled JSON parsing and unbounded Local Storage
**Vulnerability:** Application crashed silently when `localStorage` or AI API responses contained malformed JSON due to missing `try-catch` blocks around `JSON.parse`. In addition, user-generated comments lacked length limits, enabling malicious users to exhaust Local Storage space (a client-side DoS attack).
**Learning:** `JSON.parse` is inherently unsafe when handling data originating from outside the immediate execution context. Similarly, unvalidated lengths on user inputs can rapidly consume limited client-side resources like `localStorage`.
**Prevention:** Wrap all `JSON.parse` calls in a utility function (`safeJSONParse`) to catch exceptions and return fallback values. Always enforce reasonable maximum lengths on all user inputs, both on the client UI (`maxLength`) and within state/storage mutations.
