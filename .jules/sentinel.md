## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-09 - CSRF Vulnerability in OAuth
**Vulnerability:** The OAuth callback endpoint did not validate the `state` parameter against the stored state in the user's cookie, allowing CSRF attacks.
**Learning:** The state parameter in OAuth is critical to prevent CSRF attacks. It must be validated against a stored value in the user's session or cookie.
**Prevention:** Always validate the OAuth `state` parameter against a secure, HttpOnly cookie set during the authorization request.
