## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth callback endpoint was receiving a `state` parameter but wasn't verifying it against the previously set cookie.
**Learning:** OAuth flows must validate the `state` parameter against a stored value (like a cookie) to prevent CSRF attacks. Without this, an attacker could trick a victim into authenticating with the attacker's account.
**Prevention:** Always extract the saved state from the cookie and strictly compare it with the state returned by the OAuth provider before proceeding with token exchange.
