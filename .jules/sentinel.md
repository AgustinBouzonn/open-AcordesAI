## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-04-28 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints (`/oauth/:provider/callback`, `/google/callback`, `/github/callback`) were accepting the `state` parameter from the query string without validating it against the `oauth_state` cookie stored in the user's session.
**Learning:** This missing validation allows Cross-Site Request Forgery (CSRF) attacks, where an attacker could link their own OAuth account to a victim's session, leading to account takeover or unauthorized access.
**Prevention:** Always validate the `state` query parameter against a securely stored, unguessable value (like a signed cookie) during OAuth callback handling to ensure the request originated from the legitimate user.
