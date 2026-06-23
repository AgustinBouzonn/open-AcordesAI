## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-06-23 - Missing CSRF Validation in OAuth Callbacks
**Vulnerability:** OAuth callback endpoints lacked validation of the state parameter against the stored oauth_state cookie, exposing the application to CSRF.
**Learning:** The application does not use cookie-parser globally, requiring the use of parseCookies(req.headers.cookie) to read cookies.
**Prevention:** Always validate the state parameter in OAuth flows and explicitly use parseCookies from utils.ts to read cookies in this backend.
