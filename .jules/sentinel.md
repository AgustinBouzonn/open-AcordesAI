## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-24 - OAuth Login CSRF Vulnerability
**Vulnerability:** The OAuth callback endpoint in `handleOAuthCallback` retrieved the `state` parameter but failed to validate it against the `OAUTH_COOKIE` stored in the user's session.
**Learning:** The application generated and set the state correctly during the initial OAuth redirect but omitted the crucial verification step upon return, leading to a complete bypass of CSRF protection for social logins.
**Prevention:** Always enforce strict matching between the OAuth `state` parameter returned by the provider and the original state securely stored in an HTTP-only cookie before exchanging the authorization code.
