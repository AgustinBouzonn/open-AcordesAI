## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-05-03 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback endpoint (`/oauth/:provider/callback`) was failing to validate the `state` parameter passed by the OAuth provider against the `oauth_state` cookie that was set during the initial OAuth request.
**Learning:** This is a classic CSRF vulnerability. Without the state validation, an attacker could trick a logged-in user into completing an OAuth flow started by the attacker, effectively logging the victim into the attacker's account or associating the attacker's social account with the victim's profile.
**Prevention:** Always extract and validate the `state` query parameter against the stored `oauth_state` value before proceeding with the token exchange in OAuth flows.
