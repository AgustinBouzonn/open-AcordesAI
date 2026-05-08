## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Protection in OAuth Callback
**Vulnerability:** The OAuth callback route did not validate the `state` parameter against the stored `OAUTH_COOKIE`. This allowed potential Cross-Site Request Forgery (CSRF) attacks, where an attacker could force a victim to log in as the attacker by tricking them into clicking a link with the attacker's `state` and `code`.
**Learning:** OAuth flows must validate the `state` parameter to ensure the callback is part of a legitimate authentication flow initiated by the same user. This prevents CSRF attacks where the callback is initiated by a third party.
**Prevention:** Always validate the `state` query parameter against a secure, HttpOnly, and SameSite=none cookie (e.g., `oauth_state`) set during the start of the OAuth flow.
