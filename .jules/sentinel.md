## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-18 - Missing CSRF State Validation in OAuth Callbacks
**Vulnerability:** The OAuth callback routes (`/google/callback`, `/github/callback`, `/oauth/:provider/callback`) retrieved the `state` parameter from the query string but failed to validate it against the original `state` value stored in the user's `oauth_state` cookie. This allows an attacker to execute a Cross-Site Request Forgery (CSRF) attack, potentially logging a user into an attacker-controlled account (Login CSRF).
**Learning:** Even if a state parameter is generated and sent during the initial OAuth flow, it is completely useless for security if the application does not actively verify that the returned state matches the stored state during the callback.
**Prevention:** Always validate the `state` parameter returned in an OAuth callback against the original value securely stored in the user's session or an HTTP-only, secure cookie before proceeding with token exchange.
