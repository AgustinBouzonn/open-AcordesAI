## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the stored `oauth_state` cookie, exposing the application to Cross-Site Request Forgery (CSRF) attacks during social login.
**Learning:** Returning a `state` parameter from the identity provider is not enough; the backend must actually verify that the returned `state` matches the one originally set in the user's secure cookie to prevent an attacker from forcefully logging a victim into the attacker's account.
**Prevention:** Always validate the `state` query parameter against the stored `oauth_state` cookie in OAuth callback handlers before exchanging the authorization code for a token.
