## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback endpoints did not validate the `state` parameter against the original `state` value stored in the user's browser, leading to CSRF vulnerability during social login.
**Learning:** Checking that `state` exists is not enough. You must securely store the generated `state` (e.g. in an HTTP-only cookie) during the `/start` phase and mathematically verify it strictly matches the returned `state` parameter during the `/callback` phase.
**Prevention:** Always implement full state parameter verification using secure cookies when handling OAuth flows.
