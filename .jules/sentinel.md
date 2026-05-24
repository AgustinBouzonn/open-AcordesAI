## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Protection in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter returned by the OAuth provider against the `state` originally stored in the user's cookie (`oauth_state`), making the application vulnerable to Cross-Site Request Forgery (CSRF) login attacks.
**Learning:** OAuth `state` parameters are critical for linking a callback request to the original user session. Without validation, an attacker could trick a user into logging in with the attacker's account.
**Prevention:** Always parse the cookies on the callback request, extract the originally stored state, and ensure it strictly matches the `state` query parameter before exchanging the code for a token. Provide generic error messages if validation fails to avoid leaking state logic details.
