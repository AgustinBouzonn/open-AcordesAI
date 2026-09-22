## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-15 - Fix CSRF vulnerability in OAuth callback
**Vulnerability:** The OAuth callback (`/oauth/:provider/callback`) failed to validate the received `state` parameter against the initially generated state stored in the `OAUTH_COOKIE`.
**Learning:** Even if a state is generated and set during the start of an OAuth flow, it provides no CSRF protection unless it is explicitly verified on the callback. An attacker could initiate an OAuth flow, get an authorization code and state, and trick a victim into submitting them, logging the victim into the attacker's account.
**Prevention:** Always parse cookies on the OAuth callback and assert that `state === cookies[OAUTH_COOKIE]`. Ensure that the cookie exists before doing the comparison to handle edge cases properly.
