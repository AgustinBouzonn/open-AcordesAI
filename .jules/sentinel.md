## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-06-24 - Missing OAuth CSRF Validation
**Vulnerability:** The OAuth callback endpoint extracted the `state` parameter from the query string but failed to validate it against the stored `OAUTH_COOKIE`, allowing potential CSRF login attacks.
**Learning:** Even though a state parameter was generated and stored in a cookie during the OAuth start phase, the crucial validation step was missing in the callback, highlighting that generating tokens without verifying them provides no protection.
**Prevention:** Always extract and explicitly compare the CSRF state token from the request query with the value stored in the secure cookie before processing the OAuth callback.
