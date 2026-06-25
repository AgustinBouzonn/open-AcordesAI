## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-06-25 - OAuth CSRF Vulnerability
**Vulnerability:** Missing state parameter validation in OAuth callback allowing Login CSRF.
**Learning:** The OAuth flow failed to verify the state parameter against the stored OAUTH_COOKIE.
**Prevention:** Always validate that the state parameter in the callback matches the original cookie before proceeding.
