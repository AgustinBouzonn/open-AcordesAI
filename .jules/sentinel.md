## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-06-13 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback did not validate the `state` parameter against the original state cookie.
**Learning:** Implementing the state verification step is essential for OAuth to prevent CSRF attacks where malicious actors try to authenticate a victim against an attacker-controlled account.
**Prevention:** Ensure `state` parameters match between the callback URL and the `OAUTH_COOKIE`.
