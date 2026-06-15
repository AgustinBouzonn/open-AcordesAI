## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-06-15 - CSRF Prevention in OAuth
**Vulnerability:** OAuth callback routes were vulnerable to CSRF because the state parameter wasn't validated against the oauth_state cookie.
**Learning:** The OAUTH_COOKIE value must be verified on callback in server-rendered Express routes. Missing state validation could allow attackers to force users into an attacker-controlled account.
**Prevention:** Always validate the 'state' query parameter against a secure HTTP-only cookie using 'parseCookies(req.headers.cookie)' in OAuth callbacks.
