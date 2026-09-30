## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-18 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth callback endpoint extracted the `state` parameter from the request but did not validate it against the originally issued `OAUTH_COOKIE`, leaving the application vulnerable to CSRF login attacks.
**Learning:** Issuing a state parameter during OAuth flow is useless if it is not explicitly validated upon callback. Attackers can initiate an OAuth flow themselves and trick a victim into visiting the callback URL with the attacker's state.
**Prevention:** Always parse and compare the OAuth state parameter against the stored session/cookie state (e.g., `if (!state || !cookieState || state !== cookieState)`) before exchanging the code for tokens.
