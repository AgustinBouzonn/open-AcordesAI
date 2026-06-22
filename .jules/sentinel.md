## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-24 - Missing CSRF State Validation in OAuth Callback
**Vulnerability:** The OAuth callback did not validate the `state` parameter against the stored cookie, making the application vulnerable to Cross-Site Request Forgery (CSRF).
**Learning:** OAuth flows require validating the `state` parameter to prevent attackers from forcing users to log into the attacker's account or linking their account to an attacker's provider.
**Prevention:** Always generate a unique `state` parameter during the OAuth start phase, store it in a secure cookie, and validate that the `state` parameter returned in the callback strictly matches the stored cookie value before exchanging the code for a token.
