## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-07-11 - OAuth CSRF Protection Missing
**Vulnerability:** The OAuth callback route did not verify the `state` parameter against the `oauth_state` cookie, allowing CSRF attacks during the OAuth login flow.
**Learning:** Generating a `state` parameter and setting it in a cookie is not enough; the callback must explicitly read the cookie and compare it to the query parameter.
**Prevention:** Always validate the `state` parameter returned by the OAuth provider against the expected value stored in the user's session or a secure cookie.
