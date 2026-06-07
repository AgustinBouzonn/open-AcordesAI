## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Missing CSRF Protection in OAuth Callback
**Vulnerability:** The OAuth callback flow parsed the `state` from the query parameter but did not validate it against the `state` stored in the user's cookie, allowing CSRF attacks.
**Learning:** OAuth `state` parameters must be checked against the value stored before the redirect to ensure the callback was initiated by the same user.
**Prevention:** Always set an `OAUTH_COOKIE` with the `state` on start, then use `parseCookies` to extract it in the callback and strictly compare it to the query `state`.
