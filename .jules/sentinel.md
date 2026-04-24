## 2026-02-08 - Missing CSRF Protection in OAuth Callback
**Vulnerability:** OAuth callback routes did not validate the 'state' query parameter against the stored 'oauth_state' cookie, allowing Cross-Site Request Forgery (CSRF).
**Learning:** OAuth flows require a 'state' parameter that must be tied to the user's session (e.g., via a secure cookie). If the callback does not verify that the returned state matches the generated state, an attacker can trick a victim into linking their account to the attacker's account or logging in as the attacker.
**Prevention:** Always extract the expected state from the session/cookie and compare it strictly with the 'state' parameter returned by the OAuth provider. If they differ or are missing, reject the request immediately.

## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
