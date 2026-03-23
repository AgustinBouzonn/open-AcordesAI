## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-02-07 - LocalStorage DoS and Predictable IDs
**Vulnerability:** User inputs (comments) were saved to LocalStorage without length limits, risking DoS by exhausting local storage quotas. Also, `Date.now().toString()` was used for generating IDs which is predictable.
**Learning:** Client-side storage needs equivalent length limits as server-side databases to prevent resource exhaustion vulnerabilities. Using time-based IDs is insecure and predictable.
**Prevention:** Always enforce a maximum length limit on user input, both client-side (`maxLength`) and storage-side (truncation). Use robust methods like `crypto.randomUUID()` for unique identifiers.
