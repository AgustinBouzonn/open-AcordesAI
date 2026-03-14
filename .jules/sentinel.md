## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2023-10-27 - [LocalStorage Denial of Service via Unbounded User Input]
**Vulnerability:** User comments were being saved to LocalStorage without any length constraints on the server/storage side.
**Learning:** This exposes the application to a LocalStorage DoS vulnerability where malicious actors can quickly exhaust the ~5MB quota by sending massive strings.
**Prevention:** Always enforce client-side length constraints (e.g. `maxLength={500}`) and server-side/storage-side length truncation before saving user-generated content.
