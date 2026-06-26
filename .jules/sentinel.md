## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2025-06-26 - OAuth CSRF Protection Missing
**Vulnerability:** The OAuth callback flow did not validate the 'state' parameter against the cookie set during the initial request, leaving the application vulnerable to Cross-Site Request Forgery (CSRF).
**Learning:** Even when standard OAuth libraries or patterns are used, state validation must be explicitly implemented if managing the flow manually.
**Prevention:** Always ensure that any state parameter generated during an OAuth initialization is verified against a secure, HttpOnly cookie upon callback.
