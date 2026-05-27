## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback route in `backend/src/routes/auth/oauth.ts` did not validate the `state` query parameter against the stored `OAUTH_COOKIE`, making it susceptible to Cross-Site Request Forgery (CSRF) attacks.
**Learning:** In OAuth flows, relying solely on the presence of the `state` parameter without verifying it against the original state token sent via cookie allows attackers to trick authenticated users into linking their accounts to the attacker's OAuth account.
**Prevention:** Always parse and validate the `state` parameter returned by the OAuth provider against the securely stored original state token (e.g., in a secure HTTP-only cookie) to ensure the request originated from the legitimate user.
