## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-07-15 - OAuth Login CSRF Vulnerability
**Vulnerability:** The OAuth callback endpoint extracted the state parameter from the query but did not validate it against the originally issued OAUTH_COOKIE, allowing Login CSRF.
**Learning:** Even though the state parameter was checked for existence, it was not validated against the cookie, nullifying CSRF protection.
**Prevention:** Always validate the OAuth state parameter against the session/cookie value set during the initial authorization request.
