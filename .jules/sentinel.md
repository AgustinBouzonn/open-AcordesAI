## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## $(date +%Y-%m-%d) - Remove Hardcoded Default Secrets
**Vulnerability:** The application was using fallback default values for `JWT_SECRET` and `DATABASE_URL` (e.g., `process.env.JWT_SECRET || 'changeme-use-env-var'`).
**Learning:** This is a critical risk, as failing to set these environment variables silently falls back to known defaults, creating a significant security gap.
**Prevention:** Always rely strictly on environment variables for sensitive settings like secrets and credentials, and throw an explicit error on startup if they are missing to enforce secure configuration.
