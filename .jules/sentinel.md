## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - LocalStorage DoS and Predictable IDs
**Vulnerability:** User inputs (comments) lacked length limits (client-side and storage-side), creating a DoS vulnerability by exhausting LocalStorage quotas. Also, `Date.now()` was used for generating IDs, making them predictable and potentially vulnerable to brute-force or collision issues.
**Learning:** Client-side limits like `maxLength` can be bypassed, so server-side/storage-side limits (e.g., truncation) are also required. Predictable identifiers based on timestamps should be replaced with cryptographic UUIDs.
**Prevention:** Always enforce a maximum length limit on user inputs both in the UI and before saving to storage. Use `crypto.randomUUID()` instead of `Date.now()` for generating unique identifiers.
