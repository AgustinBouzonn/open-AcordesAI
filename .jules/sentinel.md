## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-06-09 - CSRF in OAuth Callback
**Vulnerability:** The OAuth callback endpoint was susceptible to CSRF attacks because it didn't validate the `state` parameter returned from the OAuth provider against a locally stored cookie.
**Learning:** During the OAuth flow, a `state` token is generated, stored locally (e.g. in a cookie), and passed to the provider. The callback endpoint must extract the stored cookie, validate it against the returned `state`, and clear it.
**Prevention:** In Express without a global cookie-parser, always ensure you parse `req.headers.cookie` securely (e.g., using `parseCookies`) and validate the token before proceeding with token exchange. After reading it, always use `res.clearCookie` to prevent replay attacks.
