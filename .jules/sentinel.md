## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-07-07 - Missing OAuth State Validation (CSRF)
**Vulnerability:** OAuth callback did not validate the `state` parameter against the `OAUTH_COOKIE` cookie, allowing Login CSRF.
**Learning:** Storing the `state` in a cookie during the OAuth initialization is useless if it is not validated during the callback.
**Prevention:** Always extract the cookie using `parseCookies` and verify it precisely matches `req.query.state` before exchanging the code for a token.
