## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-05-31 - OAuth CSRF Protection Missing
**Vulnerability:** OAuth callback endpoints did not validate the `state` query parameter against the `oauth_state` cookie, making them vulnerable to Cross-Site Request Forgery (CSRF) login attacks where an attacker could link their social account to a victim's session.
**Learning:** In OAuth flows, the `state` parameter must be explicitly validated against a secure, HttpOnly cookie to ensure the request originated from the same user agent that initiated the flow.
**Prevention:** Always parse cookies in OAuth callbacks and enforce strict equality `state === storedState` before exchanging the authorization code for a token.
