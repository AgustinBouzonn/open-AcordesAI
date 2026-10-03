## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-10-03 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth callback (`/api/auth/oauth/:provider/callback`) extracted the `state` parameter from the query but did not validate it against the originally issued `OAUTH_COOKIE`.
**Learning:** This missing validation enables CSRF attacks on the OAuth flow, allowing attackers to link their own social accounts to a victim's session by tricking the victim into visiting a crafted callback URL.
**Prevention:** Always validate the OAuth `state` parameter against a secure, HTTP-only cookie set during the initial authorization request before completing the token exchange.
