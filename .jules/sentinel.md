## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-09-25 - Missing OAuth State Validation
**Vulnerability:** The OAuth callback handler was not verifying the `state` parameter against the generated `oauth_state` cookie, allowing CSRF attacks during the social login flow.
**Learning:** Even though a `state` parameter is passed in the URL and checked for existence, it must be compared to a securely stored value (like an `httpOnly` cookie) to actually prevent CSRF.
**Prevention:** Always compare the OAuth `state` query parameter against the original state token stored in an `httpOnly` session/cookie.
