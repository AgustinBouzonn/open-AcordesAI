## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-06-12 - Missing CSRF validation in OAuth Callback
**Vulnerability:** The OAuth callback endpoint (`/api/auth/oauth/:provider/callback`) was not verifying the `state` parameter against the stored `OAUTH_COOKIE`, leaving the application vulnerable to Cross-Site Request Forgery (CSRF) during the login flow. An attacker could force a victim to log in as the attacker by injecting a pre-authorized code.
**Learning:** Even though `state` was passed correctly in the query parameters, simply checking for its existence is not sufficient. It must be strictly compared with the original state generated during the `/start` phase, which is stored in an HTTP-only cookie.
**Prevention:** Always validate the `state` query parameter against the stored `oauth_state` cookie value in OAuth callback routes to ensure the authorization request was initiated by the current session.
