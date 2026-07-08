## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF validation in OAuth Callback
**Vulnerability:** The OAuth callback handler was not verifying the `state` parameter against the stored `OAUTH_COOKIE`.
**Learning:** Failing to validate the state parameter in an OAuth flow opens up the application to CSRF attacks, allowing attackers to link accounts.
**Prevention:** Always validate that the state returned from the OAuth provider matches the state stored securely (e.g. via cookie) before proceeding.
