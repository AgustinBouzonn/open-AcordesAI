## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-02-28 - Missing CSRF State Validation in OAuth Callbacks
**Vulnerability:** OAuth callback endpoints were not validating the `state` query parameter against the stored `oauth_state` cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF). An attacker could link their own provider account to a victim's session.
**Learning:** Even if a `state` parameter is generated and passed to the provider, it must be explicitly validated on the callback route.
**Prevention:** Always parse the cookies and verify that `req.query.state` strictly matches the `oauth_state` cookie before proceeding with the token exchange. Ensure generic error messages are returned on failure to prevent information leakage.
