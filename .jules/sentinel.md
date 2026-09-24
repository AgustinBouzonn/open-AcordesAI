## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-03-22 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback handler was not verifying that the `state` parameter returned by the identity provider matched the state value stored in the user's cookies (`oauth_state`), allowing a Login CSRF vulnerability.
**Learning:** During OAuth login flows, it is critical to implement CSRF state validation correctly. Even though a state token was being generated and sent, its absence of validation on the callback route defeated its entire purpose.
**Prevention:** Always extract the stored state from the session/cookie and enforce a strict equality check (`state !== cookies[OAUTH_COOKIE]`) along with existence checks (`!cookies[OAUTH_COOKIE]`) during the OAuth callback phase before exchanging the authorization code for an access token.
