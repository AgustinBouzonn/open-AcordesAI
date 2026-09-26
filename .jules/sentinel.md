## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2025-03-01 - Missing OAuth CSRF Validation
**Vulnerability:** The OAuth callback handler was not validating the `state` parameter against the `oauth_state` cookie, making it vulnerable to CSRF attacks.
**Learning:** Always explicitly verify that the state parameter and the cookie exist before comparison. Relying solely on `!==` can lead to bypasses if the cookie is undefined during an uninitiated attack.
**Prevention:** Implement strict comparison checks `if (!state || !cookies[OAUTH_COOKIE] || state !== cookies[OAUTH_COOKIE])` during OAuth flow.
