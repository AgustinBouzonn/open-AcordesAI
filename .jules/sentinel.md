## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Protection in OAuth Callback
**Vulnerability:** The OAuth callback did not validate the `state` query parameter against the stored `oauth_state` cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF) during the authentication flow.
**Learning:** OAuth state validation is crucial to ensure that the authentication response corresponds to a request initiated by the legitimate user. Without it, an attacker could trick a user into authenticating with the attacker's account or hijack the authentication flow.
**Prevention:** Always generate a unique `state` parameter when initiating an OAuth flow, store it securely (e.g., in an HttpOnly cookie), and strictly validate that the returned `state` parameter exactly matches the stored value before exchanging the code for a token.
