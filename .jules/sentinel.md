## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-24 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth callback handler in `backend/src/routes/auth/oauth.ts` did not validate the CSRF `state` parameter against the stored `OAUTH_COOKIE`.
**Learning:** Even though a `state` parameter was generated and sent, relying solely on its existence without strictly comparing it to the session's stored cookie leaves the application vulnerable to Cross-Site Request Forgery (CSRF).
**Prevention:** Always explicitly parse cookies and verify that the `state` parameter exactly matches the original value stored in the user's cookie before proceeding with OAuth token exchange.
