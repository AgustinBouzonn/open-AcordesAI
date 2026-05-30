## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback routes (`/oauth/:provider/callback`) were not properly validating the `state` parameter against the stored `oauth_state` cookie, creating a Cross-Site Request Forgery (CSRF) vulnerability where an attacker could force a user into a login session created by the attacker.
**Learning:** OAuth flows need both endpoints to be secure. Passing `state` to the provider during initiation isn't enough; the callback must explicitly verify that the returned `state` exactly matches the `state` originally stored for that user's session.
**Prevention:** Always validate the returned `state` query parameter against a secure, HttpOnly, SameSite cookie (`oauth_state`) before attempting the OAuth token exchange.
