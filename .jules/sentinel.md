## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Cross-Site Request Forgery (CSRF) in OAuth flow
**Vulnerability:** The OAuth callback endpoint was missing CSRF protection, allowing attackers to potentially link an arbitrary account to the victim's session by sending a maliciously crafted login link.
**Learning:** OAuth `state` parameters must not only be generated and sent, but strictly validated against the server-generated value (stored securely in a cookie/session) upon callback execution.
**Prevention:** Always parse cookies upon an OAuth callback and verify the `state` parameter supplied by the provider matches the local state cookie before exchanging tokens.
