## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-06-16 - Missing CSRF State Validation in OAuth
**Vulnerability:** OAuth callback routes lacked state validation against the stored `OAUTH_COOKIE`, opening the app to CSRF attacks during the OAuth flow.
**Learning:** Because the app does not use `cookie-parser` globally, reading cookies requires manually invoking the `parseCookies` utility, which was overlooked.
**Prevention:** Always parse headers using `parseCookies(req.headers.cookie)` and explicitly validate the OAuth `state` parameter against the stored HTTP-only cookie before exchanging the authorization code.
