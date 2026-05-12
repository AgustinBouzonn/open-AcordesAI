## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-05-12 - Missing CSRF State Validation in OAuth
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the stored state in `OAUTH_COOKIE`.
**Learning:** Without state validation, the application is vulnerable to Cross-Site Request Forgery (CSRF) attacks where an attacker can link their external account to a victim's session.
**Prevention:** Always validate the `state` parameter in OAuth callbacks against the state stored securely in the user's session/cookie before proceeding with the token exchange.
