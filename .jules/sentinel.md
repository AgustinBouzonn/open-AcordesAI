## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Client-Side Denial of Service via Storage Corruption
**Vulnerability:** The application blindly parsed `localStorage` data using `JSON.parse()`, which could crash the entire application if the data was malformed (e.g., via user tampering or XSS). Additionally, `localStorage.setItem` could throw `QuotaExceededError` if storage was full, also crashing the app.
**Learning:** Client-side storage is an external input source and should be treated as untrusted. Blindly trusting its format or availability is a reliability and security risk (DoS).
**Prevention:** Always wrap `JSON.parse()` for storage data in a try-catch block (or use a `safeJSONParse` utility). Similarly, wrap `localStorage.setItem()` to handle quota errors gracefully.
