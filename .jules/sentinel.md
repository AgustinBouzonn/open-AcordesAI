## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2025-03-05 - OAuth CSRF Protection
**Vulnerability:** Missing state parameter validation in OAuth callback.
**Learning:** The OAuth state parameter was being generated and sent as a cookie, but it wasn't validated upon the callback, exposing the application to CSRF during social login.
**Prevention:** Always validate the state parameter against the stored session/cookie value on the OAuth callback route.
