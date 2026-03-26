## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Local Storage DoS and Predictable IDs
**Vulnerability:** Unbounded user inputs for comments could be used to exhaust `localStorage` quota. Furthermore, `Date.now().toString()` was used to generate comment IDs, leading to predictable identifiers.
**Learning:** Client-side storage (like `localStorage` or `sessionStorage`) is limited and needs strict size limits on user-provided data. Unique identifiers should be generated securely.
**Prevention:** Implement reasonable `maxLength` limits on client-side inputs. Truncate user-provided input before saving to storage. Use `crypto.randomUUID()` for generating secure, non-predictable unique IDs.
