## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - OAuth State CSRF Vulnerability
**Vulnerability:** OAuth callback endpoints (`/oauth/:provider/callback`, `/google/callback`, `/github/callback`) were receiving a `state` parameter but not validating it against the stored `oauth_state` cookie, creating a CSRF vulnerability.
**Learning:** During the OAuth flow, the `state` parameter must not only be generated and passed, but strictly validated upon callback to ensure the request originated from the legitimate user session.
**Prevention:** Always compare the `state` parameter from the OAuth callback query string to the `state` value stored in a secure cookie during the initialization phase of the OAuth flow.
