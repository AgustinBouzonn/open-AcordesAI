## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-03-27 - OAuth CSRF State Validation
**Vulnerability:** The OAuth callback handler checked for the presence of a 'state' parameter but didn't actually validate it against the originally issued state cookie.
**Learning:** OAuth state generation is useless if not strictly verified upon callback. An attacker could initiate an OAuth flow, capture the authorization code, and trick a victim into submitting it (CSRF), binding the attacker's account to the victim's session.
**Prevention:** Always validate that the 'state' parameter returned by the OAuth provider exactly matches the state previously stored in a secure, HttpOnly, same-site restricted cookie during the initial request.
