## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-19 - DoS via LocalStorage
**Vulnerability:** The application crashed when `localStorage` contained valid JSON of an unexpected type (e.g., `"null"` when an array was expected), causing `null.map()` errors during rendering.
**Learning:** `JSON.parse` successfully parses `"null"`, `"123"`, etc., which bypasses `try-catch` blocks designed only for syntax errors. Robust storage handling requires explicit type validation of the parsed result.
**Prevention:** Implement `safeJSONParse` with type checks or ensure the consuming code validates the structure (e.g., `Array.isArray()`) before accessing properties.
