## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-03-10 - LocalStorage DoS in Comment Functionality
**Vulnerability:** User comments were saved to `localStorage` without any length restrictions, allowing a malicious actor to perform a Denial of Service (DoS) attack by exhausting local storage limits.
**Learning:** Client-side storage mechanisms like `localStorage` have limited capacity (typically ~5MB) and can be easily exhausted by unbounded user inputs, causing the application to crash or become unresponsive.
**Prevention:** Always enforce reasonable length constraints on user inputs (e.g., using `maxLength` on form inputs and truncating data before saving to storage).
