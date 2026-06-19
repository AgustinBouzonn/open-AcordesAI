## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-06-19 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** OAuth callback did not validate the state parameter against the stored state cookie, allowing CSRF attacks.
**Learning:** The state parameter must be strictly validated against the originally generated and securely stored state cookie to prevent forged authentications.
**Prevention:** Always parse cookies and explicitly check that req.query.state strictly equals the securely stored OAUTH_COOKIE before exchanging tokens.
