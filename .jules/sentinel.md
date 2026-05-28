## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback endpoints did not validate the `state` query parameter against the stored `oauth_state` cookie, allowing potential Cross-Site Request Forgery (CSRF) attacks where an attacker could link an arbitrary OAuth account to the victim's session.
**Learning:** OAuth flows require strict validation of the `state` parameter to prevent CSRF. The parameter must be stored securely (e.g., in an HTTP-only, secure cookie) before redirecting to the provider and verified upon callback.
**Prevention:** Always validate the `state` query parameter against the stored state in a secure cookie during OAuth callbacks. Ensure the cookie is set securely (HttpOnly, Secure, SameSite=Lax/None depending on the flow) and cleared after use.
