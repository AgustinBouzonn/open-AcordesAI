## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-07-13 - OAuth CSRF Vulnerability
**Vulnerability:** The OAuth callback endpoint in `backend/src/routes/auth/oauth.ts` did not verify the `state` parameter against the value stored in the `OAUTH_COOKIE` during the initial request, allowing for Cross-Site Request Forgery (CSRF).
**Learning:** Always validate the `state` parameter in OAuth callbacks to ensure the request originated from the same user session. Failure to do so can allow attackers to trick users into linking their accounts to an attacker's account.
**Prevention:** Use a cryptographically secure random string for the `state` parameter, store it in a secure HTTP-only cookie, and verify it matches the `state` parameter in the callback response.
