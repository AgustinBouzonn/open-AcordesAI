## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Protection in OAuth Callback
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the value initially stored in the user's `oauth_state` cookie, creating a Cross-Site Request Forgery (CSRF) vulnerability where an attacker could link an arbitrary account to the victim's session.
**Learning:** OAuth flows inherently rely on redirection from an external provider back to the application. Without enforcing state validation on the callback route, the application blindly trusts that the redirect originated from its own initiated flow, exposing users to account takeover or unauthorized data access.
**Prevention:** Always validate the OAuth `state` parameter against a secure, HTTP-only cookie stored during the initialization phase to ensure the request is part of a legitimate user-initiated flow.
