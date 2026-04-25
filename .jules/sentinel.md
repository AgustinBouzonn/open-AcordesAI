## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints retrieved the `state` parameter from the query but failed to validate it against the originally set `oauth_state` cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF).
**Learning:** OAuth integrations must always validate the `state` parameter to prevent attackers from tricking users into logging into an attacker-controlled account or completing unauthorized actions.
**Prevention:** Always compare the `state` query parameter against a securely stored value (such as a signed or HttpOnly cookie) during the OAuth callback phase.
