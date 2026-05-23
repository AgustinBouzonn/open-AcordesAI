## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF protection in OAuth callback
**Vulnerability:** The OAuth callback did not validate the `state` parameter against the initial value saved in cookies, opening the application to Cross-Site Request Forgery (CSRF) vulnerabilities during login.
**Learning:** When implementing OAuth, you must generate a random `state` during the initial redirect, store it securely (e.g., in an HTTP-only cookie), and verify that the `state` returned in the callback matches the stored value.
**Prevention:** Always validate the `state` parameter in OAuth callbacks. If they do not match, fail securely without revealing detailed error information to the client.
