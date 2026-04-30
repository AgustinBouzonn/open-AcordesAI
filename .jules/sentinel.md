## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - OAuth Login CSRF Vulnerability
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the original state stored in the `OAUTH_COOKIE`, making the application vulnerable to login Cross-Site Request Forgery (CSRF).
**Learning:** Even though the OAuth provider returns a `state` query parameter, it provides no security benefit unless the application validates it against the trusted state originally issued to the user (e.g., stored in an HttpOnly cookie).
**Prevention:** Always parse the cookie header in the callback route to extract the stored state and strictly compare it against the `state` query parameter before exchanging the authorization code.
