## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter returned by the OAuth provider against the `oauth_state` cookie stored in the user's browser. This made the application vulnerable to Cross-Site Request Forgery (CSRF) attacks, where an attacker could link a victim's account to the attacker's OAuth account.
**Learning:** Even if a state token is generated and sent to the OAuth provider (and stored in a cookie), it provides no protection unless explicitly validated upon the callback.
**Prevention:** Always parse cookies in the callback route and assert that the `state` query parameter strictly equals the stored state token before proceeding with token exchange.
