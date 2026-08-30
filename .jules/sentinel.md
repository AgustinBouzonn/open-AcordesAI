## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-24 - OAuth CSRF Callback State Validation
**Vulnerability:** The OAuth callback handler was not verifying the state parameter against the generated state stored in a cookie.
**Learning:** By not verifying the state parameter against a secure cookie, the application was vulnerable to CSRF attacks where an attacker could link an arbitrary OAuth account to a victim's session.
**Prevention:** Always verify that both the state parameter from the OAuth provider and the OAUTH_COOKIE exist and strictly match before processing the token exchange.
