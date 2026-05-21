## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callback
**Vulnerability:** The OAuth callback endpoints did not validate the `state` query parameter against the original `state` value stored in the user's cookies.
**Learning:** Without validating the `state` parameter, an attacker can trick a user into logging in as the attacker, potentially linking the victim's account to an attacker-controlled OAuth provider, or force the victim to log in using an attacker-controlled session (Login CSRF).
**Prevention:** Always parse the cookies and validate the `state` parameter returned by the OAuth provider against the `state` cookie initially set when starting the OAuth flow.
