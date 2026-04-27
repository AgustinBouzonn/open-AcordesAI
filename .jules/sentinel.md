## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-04-27 - CSRF in OAuth Callbacks
**Vulnerability:** OAuth callbacks did not validate the `state` parameter against a stored session/cookie value, leaving the application vulnerable to Cross-Site Request Forgery (CSRF) login attacks.
**Learning:** The OAuth2 `state` parameter must be checked to verify the request originated from our application, preventing attackers from forcing users into a session the attacker controls.
**Prevention:** Always set a secure cookie with a randomly generated `state` value when initiating OAuth flows and validate it rigorously on the callback endpoint.
