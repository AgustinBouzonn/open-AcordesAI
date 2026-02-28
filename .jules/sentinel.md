## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-24 - Unbounded Input in Local Storage (DoS)
**Vulnerability:** User-provided comments were saved to `localStorage` without any length limits, allowing a malicious user (or an automated script) to easily exhaust the 5MB browser storage quota and crash/break the application (Local Storage Denial of Service).
**Learning:** Client-side storage is finite and easily manipulated by users. Relying purely on UI constraints is insufficient; data must be explicitly truncated or validated before being written to storage mechanisms.
**Prevention:** Always enforce a `maxLength` on user input fields and perform server-side (or in this case, pre-storage client-side) truncation (e.g., `text.slice(0, 500)`) before saving unstructured data.
