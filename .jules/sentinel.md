## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-06-18 - Missing CSRF Validation in OAuth Flow
**Vulnerability:** OAuth callback endpoints were not validating the returned state parameter against the initial stored state, leaving the flow open to CSRF.
**Learning:** The state parameter in OAuth is critical to link the initial request to the callback, preventing login CSRF. Although a state was generated and sent, it wasn't verified on return.
**Prevention:** Always parse cookies manually if cookie-parser isn't used globally, and strictly compare the returned state against the stored cookie before executing the token exchange.
