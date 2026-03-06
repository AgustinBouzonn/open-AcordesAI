## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Unhandled JSON parsing exceptions (DoS Risk)
**Vulnerability:** Calling `JSON.parse` directly on `localStorage` values or untrusted AI API responses could throw an unhandled exception if the data is corrupted, crashing the application.
**Learning:** Client-side applications must treat local storage and external APIs as untrusted input. A malformed string can lead to a Denial of Service (DoS) for the user on page load.
**Prevention:** Implement and enforce a `safeJSONParse` utility that wraps `JSON.parse` in a try-catch block and returns a fallback value.
