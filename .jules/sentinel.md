## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-06-28 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback handler (`handleOAuthCallback` in `backend/src/routes/auth/oauth.ts`) was reading the `state` from the query parameters, but it failed to validate it against the `state` stored in the user's `OAUTH_COOKIE`. This allowed for Cross-Site Request Forgery (CSRF) via a malicious OAuth redirect link containing a different user's session state.
**Learning:** OAuth state verification must strictly compare the state returned in the query parameter against the securely generated state stored during the authorization initiation.
**Prevention:** Always parse and retrieve the stored state from the session/cookie and enforce a strict equality check (`state === storedState`) before exchanging an authorization code for an access token.
