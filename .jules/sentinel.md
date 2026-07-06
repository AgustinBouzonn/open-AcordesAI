## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing OAuth CSRF Validation
**Vulnerability:** The OAuth callback endpoint extracted the `state` query parameter but failed to validate it against the `state` cookie set in the `/start` request, exposing the application to OAuth CSRF attacks (e.g., login-CSRF).
**Learning:** Returning a `state` parameter is not enough; the server must explicitly verify that the returned state matches the one stored in the user's session/cookie to establish trust and ensure the flow was initiated by the same user.
**Prevention:** Always implement a strict comparison between the generated OAuth state (stored securely, e.g., in a signed or HttpOnly cookie) and the state returned by the provider in the callback endpoint before exchanging the authorization code.
