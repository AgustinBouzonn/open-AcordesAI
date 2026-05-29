## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** OAuth callback endpoints (`/oauth/:provider/callback`) do not validate the `state` parameter against the stored `OAUTH_COOKIE`, allowing potential CSRF attacks where an attacker can force a user to log into the attacker's account or link the attacker's social account to the user's account.
**Learning:** OAuth flows must always enforce `state` validation to ensure the callback request originated from the same user session that initiated the flow.
**Prevention:** Extract the `state` parameter from the callback request and strictly compare it with the `oauth_state` cookie value before exchanging the authorization code.

## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
