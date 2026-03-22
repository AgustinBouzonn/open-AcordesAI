## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-24 - [LocalStorage DoS and Predictable ID]
**Vulnerability:** The comment feature lacked input length limits allowing users to submit excessively long comments, which could exhaust LocalStorage capacity (LocalStorage DoS). Additionally, `Date.now().toString()` was used for generating comment IDs, which is predictable.
**Learning:** Storing user input in `localStorage` without enforcing maximum length limits leaves the application vulnerable to Denial of Service via storage exhaustion. Predictable IDs such as timestamps (`Date.now()`) can lead to ID collisions or allow attackers to guess entity identifiers if they become exposed or used in API calls.
**Prevention:** Always enforce strict length limits on user input (e.g., `<textarea maxLength={500} />` and server-side/storage-side `.slice(0, 500)` truncations). Always use `crypto.randomUUID()` for generating unique IDs to prevent predictability and collision vulnerabilities.
