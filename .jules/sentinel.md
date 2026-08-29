## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-08-29 - Missing CSRF Protection in OAuth Callback
**Vulnerability:** The OAuth callback handler was not verifying the `state` parameter against the stored `oauth_state` cookie.
**Learning:** OAuth flows must validate the state parameter to prevent Cross-Site Request Forgery (CSRF) attacks, where an attacker tricks a user into authenticating with the attacker's account.
**Prevention:** Always parse and compare the state parameter received from the OAuth provider with the state stored in a secure cookie during the initialization phase.
