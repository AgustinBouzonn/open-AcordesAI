## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-05-18 - OAuth CSRF Protection
**Vulnerability:** The OAuth flow didn't validate the `state` query parameter returned in the callback against the `OAUTH_COOKIE` that was set in the `/start` request.
**Learning:** Always validate that the `state` returned by an external OAuth provider exactly matches the initial `state` sent to prevent CSRF attacks.
**Prevention:** The OAuth `/start` route should generate a state, store it in an httpOnly cookie, and pass it to the provider. The `/callback` route must parse the cookies and strictly compare them, failing early if they do not match.
