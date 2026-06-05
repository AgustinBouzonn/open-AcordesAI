## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-02-07 - Missing CSRF State Validation in OAuth Flow
**Vulnerability:** The OAuth callback routes (`/oauth/:provider/callback`) accepted a `state` parameter from the provider but never validated it against the state initially set in the `OAUTH_COOKIE` during the `/oauth/:provider/start` flow. This allowed Cross-Site Request Forgery (CSRF) vulnerabilities.
**Learning:** Returning a `state` via cookie and query param is insufficient if they are not explicitly validated against each other upon callback.
**Prevention:** Always parse cookies using the `parseCookies` utility and assert `state === cookies[OAUTH_COOKIE]` before proceeding with token exchange in OAuth callback routes.
