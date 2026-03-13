## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Local Storage Denial of Service (DoS) via Unbounded Inputs
**Vulnerability:** User comments were being saved to Local Storage without any length limitations. A malicious user or script could repeatedly submit excessively large comments, quickly exhausting the browser's 5MB Local Storage quota and causing the application to crash or fail to save legitimate user data.
**Learning:** Client-side storage mechanisms (Local Storage, IndexedDB) are susceptible to DoS attacks if inputs are not strictly bounded, similar to server-side database exhaustion.
**Prevention:** Always enforce strict length limits on user inputs (e.g., `maxLength={500}`) at the UI level and perform defensive truncation before saving to any storage medium.
