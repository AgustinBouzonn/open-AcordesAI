## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - LocalStorage Denial of Service (DoS) via Unbounded Inputs
**Vulnerability:** User-submitted comments had no client-side or server-side (storage-side) length limits, allowing malicious users to quickly exhaust the 5MB browser LocalStorage quota by submitting massive text blocks.
**Learning:** Client-side storage (LocalStorage, IndexedDB) is a limited resource that is vulnerable to DoS attacks. Client-side validation is easily bypassed.
**Prevention:** Always enforce strict maximum length constraints (e.g., 500 characters) at the storage layer before persisting data, in addition to client-side attributes like `maxLength` for UX.