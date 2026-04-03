## 2026-02-07 - Hardcoded Fallback Secrets Exposing the Database and JWT Tokens
**Vulnerability:** Core sensitive settings like `DATABASE_URL` and `JWT_SECRET` used hardcoded fallback values if the corresponding environment variables were missing.
**Learning:** Hardcoded secrets and fallback default strings pose a massive risk if accidentally exposed or if deployments lack configuration, causing production environments to use default non-secure keys.
**Prevention:** Fail fast securely. Critical application secrets MUST NOT have fallback strings. The application should immediately throw an initialization error if crucial environment variables are absent.

## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
