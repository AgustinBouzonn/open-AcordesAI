## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-10-02 - OAuth CSRF State Validation Missing
**Vulnerability:** The OAuth callback endpoint (`/api/auth/oauth/:provider/callback`) was missing validation for the `state` parameter against the `oauth_state` cookie.
**Learning:** Custom OAuth implementations can easily overlook state validation, especially when cookies aren't parsed automatically by standard middleware (e.g., missing `cookie-parser`).
**Prevention:** Always parse cookies using the custom `parseCookies` utility and explicitly verify that `state` exactly matches the `oauth_state` cookie before proceeding with token exchange.
