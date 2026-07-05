## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-07-05 - Missing CSRF State Validation in OAuth
**Vulnerability:** The OAuth callback endpoint accepted the state parameter from the query string without verifying that it matches the state originally stored in the user's secure cookie.
**Learning:** Generating a state parameter is not enough for CSRF protection; the application must independently verify that the state in the callback query matches the state tied to the user session.
**Prevention:** Always compare the OAuth callback state parameter against the value stored in a secure, HttpOnly, SameSite cookie set during the OAuth initiation phase.
