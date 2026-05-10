## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-05-10 - CSRF Vulnerability in OAuth
**Vulnerability:** OAuth callbacks were not validating the `state` parameter against a stored cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF) attacks where an attacker could force a user to log in with the attacker's account.
**Learning:** The `state` parameter in OAuth is crucial for preventing CSRF attacks. It must be generated securely, stored in a secure cookie, and validated upon callback.
**Prevention:** Always generate a secure random `state` string, store it in an HttpOnly, Secure cookie, pass it to the OAuth provider, and strictly validate that the returned `state` matches the stored cookie before proceeding with the token exchange.
