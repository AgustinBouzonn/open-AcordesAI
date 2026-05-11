## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-05-11 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback routes (`/api/auth/oauth/:provider/callback`) were not validating the `state` query parameter against the stored `OAUTH_COOKIE` (`oauth_state`) value. This allowed potential Cross-Site Request Forgery (CSRF) attacks where an attacker could link a victim's session to an attacker-controlled social account.
**Learning:** The state parameter must be strictly validated against a stored value (e.g. cookie) set before the OAuth redirect to ensure the callback was actually initiated by the current user. When failing, the error messages should remain generic to avoid leaking vulnerability details.
**Prevention:** Always validate the state parameter against the stored session/cookie data in OAuth callback routes using the exported `parseCookies` utility and fail securely.
