## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-06-21 - Missing CSRF Validation in OAuth Callback
**Vulnerability:** The OAuth callback route relied on the `state` parameter but failed to validate it against the stored session cookie, leaving it vulnerable to CSRF attacks.
**Learning:** OAuth integrations must strictly validate the state parameter against the server-issued state stored in an HTTP-only cookie.
**Prevention:** Always parse and compare the `state` parameter from the OAuth callback request against the `oauth_state` cookie before proceeding with the token exchange.
