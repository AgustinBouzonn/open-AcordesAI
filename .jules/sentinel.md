## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** OAuth callback routes handled incoming requests without validating the `state` parameter against the stored state in the user's cookie.
**Learning:** When initiating OAuth flows, the server must store a random state value (usually in an HTTP-only cookie) and verify it upon receiving the callback to protect against Cross-Site Request Forgery (CSRF).
**Prevention:** Explicitly validate that `req.query.state` matches the stored cookie value (`OAUTH_COOKIE`) before processing the OAuth code exchange.
