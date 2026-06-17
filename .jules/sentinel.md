## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-06-17 - CSRF Protection in OAuth Callback
**Vulnerability:** OAuth callback did not validate the `state` parameter against a stored cookie, making it vulnerable to CSRF attacks.
**Learning:** Implementing explicit state validation with cookies is crucial for preventing cross-site request forgery during OAuth flows.
**Prevention:** Always compare the `state` parameter returned by the OAuth provider with the `state` securely stored in a cookie before completing the authentication.
