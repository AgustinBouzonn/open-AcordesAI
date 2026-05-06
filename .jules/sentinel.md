## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Protection in OAuth Callbacks
**Vulnerability:** The OAuth callbacks in `backend/src/routes/auth/oauth.ts` did not validate the `state` query parameter against the stored `oauth_state` cookie, allowing potential CSRF (Cross-Site Request Forgery) attacks where a malicious site could forge an authentication request using the victim's social account.
**Learning:** OAuth `state` validation requires reading the original state stored in cookies before the redirect, and strictly comparing it against the returned state during the callback to ensure the request originated from the same user session.
**Prevention:** Always parse cookies (`parseCookies`) and ensure the state parameter passed back strictly matches the one initially stored when the OAuth flow was started, failing securely if they differ or are missing.
