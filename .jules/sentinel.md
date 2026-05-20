## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback route did not validate the `state` parameter against the one stored in the user's session/cookie, allowing potential Cross-Site Request Forgery (CSRF) where attackers could force users to log in as the attacker.
**Learning:** OAuth implementations must explicitly validate the returned `state` parameter against the previously set cookie.
**Prevention:** Generate a unique `state` parameter at the start of the OAuth flow, store it in an HTTP-only cookie, and verify that the `state` returned in the callback exactly matches the cookie value before proceeding.
