## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-10-07 - OAuth State Validation Vulnerability
**Vulnerability:** The OAuth callback handler extracted the 'state' query parameter but did not validate it against the expected state stored in the user's secure cookie, allowing Cross-Site Request Forgery (CSRF).
**Learning:** Using a strict inequality check (`!==`) for CSRF state validation can lead to bypasses or crashes if the session cookie is undefined during an uninitiated attack.
**Prevention:** Always verify that both the `state` parameter and the session cookie explicitly exist before comparison (`!state || !cookies[OAUTH_COOKIE] || state !== cookies[OAUTH_COOKIE]`).
