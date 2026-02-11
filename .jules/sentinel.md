## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-28 - Local Storage Exhaustion (DoS)
**Vulnerability:** User comments were accepted without any length validation, allowing a malicious user or script to exhaust the `localStorage` quota (~5MB) by submitting a massive string.
**Learning:** Client-side storage is a shared resource with strict limits. Validating input length is critical not just for backend database constraints, but also for client-side stability and prevention of self-DoS.
**Prevention:** Enforce strict `maxLength` limits on both the UI (textarea attributes) and the data service layer (throwing errors on violation).
