## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Prompt Injection via Allowlist Bypass & DoS via Local Storage
**Vulnerability:** A missing allowlist check for the `instrument` parameter in LLM API allowed arbitrary inputs to bypass sanitization. Missing length limits on comments caused a Local Storage Exhaustion (DoS) risk, and missing fallback handling during `JSON.parse` could crash the application.
**Learning:** Even internal parameters or dropdown selections can be manipulated by malicious actors to inject prompts. Also, frontend `localStorage` limits can be weaponized if unbounded inputs are accepted.
**Prevention:** Always validate all parameters (especially those used in LLM prompts) using strict allowlists (e.g. `['guitar', 'ukulele', 'piano']`), implement length limits (`maxLength` and `.slice`), and wrap parsing in a generic `safeJSONParse` utility.
