## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-10-04 - Missing OAuth CSRF Validation
**Vulnerability:** The OAuth callback handler was not validating the returned `state` parameter against the generated `state` stored in the user's `OAUTH_COOKIE`.
**Learning:** Generating and sending a state parameter to the provider is not enough; if the callback handler does not parse the cookies and strictly compare the parameters (`!state || !cookies[OAUTH_COOKIE] || state !== cookies[OAUTH_COOKIE]`), CSRF attacks during the OAuth flow are still possible.
**Prevention:** Always verify that both the state parameter and the state cookie exist and are strictly equal during OAuth callbacks.
