## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - OAuth CSRF Vulnerability
**Vulnerability:** OAuth callback routes did not validate the `state` parameter against the stored state in the user's `OAUTH_COOKIE` session cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF). This could allow attackers to force users into logging in with the attacker's account.
**Learning:** Even if a state token is generated and passed to the OAuth provider, it's useless unless it is strictly validated against the originally stored state upon return to the callback route.
**Prevention:** Always extract and validate the `state` parameter from the callback URL against the stored state in the secure cookie (`OAUTH_COOKIE`) before processing OAuth tokens.
