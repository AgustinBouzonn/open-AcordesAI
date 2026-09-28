## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-23 - Fix OAuth CSRF Missing Validation
**Vulnerability:** The OAuth callback did not validate the `state` parameter against the stored cookie, allowing CSRF attacks during the OAuth flow.
**Learning:** Always validate the OAuth `state` against the initiated session cookie to prevent unauthorized or forced login attempts, and explicitly ensure both exist before comparison.
**Prevention:** Ensure state validation checks `!state || !cookies[OAUTH_COOKIE] || state !== cookies[OAUTH_COOKIE]` in all OAuth flows.
