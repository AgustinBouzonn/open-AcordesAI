## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-06-27 - Missing CSRF State Validation in OAuth Flow
**Vulnerability:** The OAuth callback handler did not verify the `state` parameter against the stored `oauth_state` cookie, making the application vulnerable to Login CSRF attacks.
**Learning:** Even though the `state` parameter was generated and sent, its omission from validation rendered the protection useless.
**Prevention:** Always verify the OAuth state parameter against the originating user's session/cookie before exchanging the authorization code for a token.
