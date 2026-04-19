## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` query parameter against the stored `OAUTH_COOKIE` session state, leaving the application vulnerable to Cross-Site Request Forgery (CSRF).
**Learning:** Checking for the presence of a `state` parameter is not enough. It must be strictly compared with the original state generated during the OAuth start phase to ensure the request is part of an ongoing session initiated by the user.
**Prevention:** Always validate the OAuth `state` parameter against a securely stored, short-lived session cookie or token before completing the authentication flow.

## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
