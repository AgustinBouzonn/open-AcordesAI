## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-24 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth flow manually generated a `state` parameter and saved it to a cookie, but the callback endpoint failed to validate the returned `state` against the cookie, enabling Login CSRF attacks.
**Learning:** The application implements a custom OAuth flow instead of using a standard library like Passport.js, leading to overlooked security fundamentals like state validation during the callback phase.
**Prevention:** Always validate state parameters when handling OAuth callbacks in custom implementations, and ensure both the query parameter and the session cookie match strictly before exchanging the code for an access token.
