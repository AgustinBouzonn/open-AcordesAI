## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-27 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback routes (`/oauth/:provider/callback`) lacked validation of the `state` query parameter against the stored `OAUTH_COOKIE`.
**Learning:** Missing `state` validation in OAuth flows allows attackers to trick users into linking their sessions to attacker-controlled accounts, leading to a Cross-Site Request Forgery (CSRF) vulnerability.
**Prevention:** Always explicitly validate the `state` query parameter against the securely stored `oauth_state` cookie before proceeding with the token exchange in OAuth callbacks, failing securely if they mismatch.
