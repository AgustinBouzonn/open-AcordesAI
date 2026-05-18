## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-18 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback route did not validate the `state` parameter against the stored state cookie, allowing potential CSRF attacks where an attacker could link their own account to a victim's session.
**Learning:** OAuth flows must implement state validation to ensure the authentication request originated from the legitimate user's browser.
**Prevention:** Always validate the `state` parameter from the OAuth callback against the original `state` stored in a secure, HTTP-only cookie before processing the token exchange.
