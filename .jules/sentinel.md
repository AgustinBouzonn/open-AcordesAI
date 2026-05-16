## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback route (`/api/auth/oauth/:provider/callback`) was failing to validate the incoming `state` query parameter against the original state stored in the user's `OAUTH_COOKIE` (`oauth_state`), allowing for potential Cross-Site Request Forgery (CSRF) via login CSRF attacks.
**Learning:** Even if a state parameter is generated during the OAuth initialization phase, it provides no security benefit unless the callback explicitly verifies it against a reliable source (like a secure HTTP-only cookie).
**Prevention:** Always parse cookies on OAuth callback routes and assert `state === cookies[OAUTH_COOKIE]` before attempting to exchange the code for tokens. Failure should result in a secure, generic error message (e.g., 'No se pudo completar la autenticación social') to prevent leaking vulnerability details.
