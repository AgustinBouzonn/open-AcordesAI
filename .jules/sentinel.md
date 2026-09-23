## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-09-23 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback endpoint extracted the `state` parameter from the query string but failed to validate it against the `OAUTH_COOKIE` set during the initiation phase.
**Learning:** Even when a `state` parameter is passed to the OAuth provider and returned, it provides no protection against Cross-Site Request Forgery (CSRF) unless it is explicitly validated against the value stored in the user's session/cookie upon return.
**Prevention:** Always implement explicit validation in the OAuth callback, checking that both the returned `state` and the stored state cookie exist and exactly match (`state === cookies[OAUTH_COOKIE]`), before exchanging the code for an access token.
