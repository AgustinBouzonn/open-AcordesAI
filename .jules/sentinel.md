## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-04-04 - Missing CSRF Protection in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the stored state in the user's cookie, leaving the application vulnerable to Cross-Site Request Forgery (CSRF) login attacks where an attacker could link their own account to a victim's session.
**Learning:** OAuth integrations must consistently use the `state` parameter to maintain state between the request and the callback. This is critical to prevent malicious cross-site requests.
**Prevention:** Always generate a random `state` token before redirecting to the OAuth provider, store it in a secure HTTP-only cookie, and validate that the `state` parameter in the callback URL exactly matches the stored cookie value. If it does not match, reject the login attempt with a generic error message.
