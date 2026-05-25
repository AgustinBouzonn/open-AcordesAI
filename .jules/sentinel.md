## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-12 - Missing CSRF validation in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter returned by the identity provider against the `state` saved in the user's cookies. This allows Cross-Site Request Forgery (CSRF) attacks, where an attacker could force a victim to log in as the attacker or link the victim's account to the attacker's identity provider.
**Learning:** OAuth `state` parameters are critical for preventing CSRF attacks during the authorization code flow. They must be generated securely, stored in a secure cookie, and strictly validated upon the callback.
**Prevention:** Always generate a unique `state` parameter, store it in an HTTP-only, secure cookie, and validate it during the OAuth callback phase. Fail securely if the validation fails.
