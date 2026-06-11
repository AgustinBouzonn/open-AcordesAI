## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-06-11 - Missing CSRF validation in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the returned `state` parameter against the originally stored `oauth_state` cookie, enabling Cross-Site Request Forgery (CSRF) on login.
**Learning:** Even though a secure, HttpOnly cookie with `state` was being issued on the initial `/start` request, it was completely ignored on the callback route. Setting the cookie is only half the mitigation.
**Prevention:** Always extract the cookie values from `req.headers.cookie` (using `parseCookies` or similar) and strictly enforce that the `state` in the query parameters exacty matches the stored cookie value before exchanging the code.
