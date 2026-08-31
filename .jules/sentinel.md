## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-10-24 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth callback handler extracted the `state` query parameter but never validated it against the original state stored in the user's `OAUTH_COOKIE` cookie. This completely bypassed CSRF protection during the social login flow.
**Learning:** It is not enough to just generate and pass a `state` parameter; the callback endpoint must explicitly parse cookies and assert that the returned state matches the expected state stored in the session/cookie. Relying on the mere presence of the parameter without validation provides false security.
**Prevention:** Always parse cookies in the callback and implement a strict validation block (e.g., `if (!state || !cookies[OAUTH_COOKIE] || state !== cookies[OAUTH_COOKIE])`). Do not rely on loose truthiness or strict inequality alone without ensuring the cookie exists.
