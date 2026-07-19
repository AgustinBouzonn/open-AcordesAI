## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2025-07-19 - Missing CSRF validation in OAuth flow
**Vulnerability:** The OAuth callback did not validate the `state` query parameter against the `oauth_state` cookie, leaving it vulnerable to CSRF attacks.
**Learning:** OAuth flows must securely link the callback to the initial request to prevent attackers from injecting their own authorization code.
**Prevention:** Always generate a random `state` token, store it in an HttpOnly, secure cookie, and validate it during the callback.
