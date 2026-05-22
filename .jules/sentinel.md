## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2023-10-27 - OAuth CSRF Vulnerability via Missing State Validation
**Vulnerability:** In the OAuth callback (`backend/src/routes/auth/oauth.ts`), the `state` parameter from the query string was not validated against the `OAUTH_COOKIE` cookie previously sent to the client, leading to a Cross-Site Request Forgery (CSRF) vulnerability.
**Learning:** OAuth flows require the `state` parameter to be validated on the callback to ensure the request originated from the intended user's session, preventing attackers from linking their accounts to a victim's session.
**Prevention:** Always validate the OAuth `state` query parameter against the stored state in the user's session/cookie before exchanging the code for an access token.
