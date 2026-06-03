## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-06-03 - Missing CSRF state validation in OAuth
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the stored cookie value.
**Learning:** Without checking the `state` parameter, the application is vulnerable to Cross-Site Request Forgery (CSRF). An attacker could link a victim's account to an attacker-controlled external provider, allowing them to log in as the victim.
**Prevention:** Always validate the `state` query parameter against a securely stored cookie (e.g., `oauth_state`) during OAuth callback handling, before exchanging tokens.
