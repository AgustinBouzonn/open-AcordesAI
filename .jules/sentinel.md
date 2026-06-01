## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Token Validation in OAuth Callback
**Vulnerability:** The OAuth callback endpoint was accepting requests without verifying if the `state` parameter matched a securely stored value, leaving the application vulnerable to Cross-Site Request Forgery (CSRF). An attacker could trick a user's browser into executing an unauthorized authentication flow.
**Learning:** The `state` parameter generated during the initial OAuth redirect must be stored (e.g., in an HTTP-only, secure cookie) and explicitly validated when the OAuth provider redirects back.
**Prevention:** Always compare the `state` parameter returned by the OAuth provider against the securely stored `state` token using tools like `parseCookies` before proceeding with the token exchange.
