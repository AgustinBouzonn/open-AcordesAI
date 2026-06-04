## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Missing CSRF protection in OAuth callback
**Vulnerability:** The OAuth callback handlers (`/oauth/:provider/callback`) were reading the `state` parameter from the URL query string but were completely failing to validate it against the stored `OAUTH_COOKIE`.
**Learning:** In OAuth flows, if the `state` parameter is not validated against a stored, unguessable value (like a cookie), the application is vulnerable to Cross-Site Request Forgery (CSRF). An attacker could forge a login request and force a victim's session to be authenticated as the attacker's account.
**Prevention:** Always ensure the OAuth `state` parameter returned by the authorization server matches the state securely stored in the user's session/cookie before exchanging the code for a token.
