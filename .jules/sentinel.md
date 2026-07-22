## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-02-07 - OAuth CSRF Vulnerability
**Vulnerability:** The OAuth callback endpoint (`/api/auth/oauth/:provider/callback`) did not validate the `state` parameter against the one stored in the user's session/cookie.
**Learning:** OAuth flows without strict `state` validation are vulnerable to CSRF attacks, where an attacker can trick a victim into logging in with the attacker's social account, potentially linking the victim's session to the attacker's account.
**Prevention:** Always generate a cryptographically secure `state` token, store it in a secure, HttpOnly cookie during the authorization step, and strictly compare it against the `state` parameter returned in the callback before exchanging the code for tokens.
