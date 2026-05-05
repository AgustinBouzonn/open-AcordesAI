## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-24 - Missing CSRF Protection in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the stored `oauth_state` cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF). An attacker could trick an authenticated user into logging into the attacker's account or linking the attacker's social account to the victim's account.
**Learning:** OAuth `state` validation is critical to ensure that the request to the callback URL originated from the same user agent that initiated the OAuth flow.
**Prevention:** Always generate a secure, random `state` parameter, store it in an HTTP-only cookie, and validate that the `state` parameter received in the callback perfectly matches the stored cookie value.
