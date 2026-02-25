## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Denial of Service via Local Storage Corruption
**Vulnerability:** The application crashed (White Screen of Death) when `localStorage` contained malformed JSON because `JSON.parse` was called without a `try-catch` block during initialization.
**Learning:** Client-side state is untrusted input. Even if only the app writes to it, external factors (user scripts, browser bugs, partial writes) can corrupt it.
**Prevention:** Always wrap `JSON.parse` of storage data in a `try-catch` block and provide a safe fallback value to ensure the application remains available.
