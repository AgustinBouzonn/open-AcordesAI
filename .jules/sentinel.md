## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-03-01 - Missing CSRF validation in OAuth flow
**Vulnerability:** The OAuth callback did not validate the `state` parameter against the stored `OAUTH_COOKIE` cookie.
**Learning:** Checking for the presence of a CSRF state token is insufficient; it must be explicitly validated against the value stored in the user's session/cookie to prevent CSRF attacks. Relying solely on `!==` without checking existence can also lead to bypasses.
**Prevention:** Always compare the `state` query parameter against a secure, HTTP-only cookie set during the initiation phase of the OAuth flow.
