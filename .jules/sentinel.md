## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-24 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback endpoint did not validate the state parameter against the stored oauth_state cookie, allowing CSRF attacks.
**Learning:** OAuth flows require validating the state parameter on the callback to ensure the request was initiated by the same user.
**Prevention:** Always parse cookies and validate the state parameter in the OAuth callback endpoint.
