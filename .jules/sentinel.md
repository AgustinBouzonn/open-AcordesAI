## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the value stored in the user's session/cookie before proceeding with the token exchange. This could allow an attacker to forge a request and associate their own social account with the victim's session (CSRF login).
**Learning:** Even though the `state` parameter was being generated and sent in the initial authorization request, the absence of a validation step in the callback meant it provided no actual CSRF protection.
**Prevention:** Always validate the `state` parameter returned by the OAuth provider against the securely stored (e.g., HTTP-only cookie) `state` value before performing the token exchange or logging the user in.
