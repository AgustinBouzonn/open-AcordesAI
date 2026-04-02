## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-12 - Hardcoded Fallback Secrets
**Vulnerability:** The application used hardcoded fallback values for secrets like `JWT_SECRET` and `DATABASE_URL` (e.g., `process.env.JWT_SECRET || 'changeme-use-env-var'`). This could allow attackers to bypass authentication or access the database if environment variables are misconfigured or omitted during deployment.
**Learning:** Hardcoded default secrets create a false sense of security and a backdoor if the environment isn't perfectly configured. It's better for the application to fail to start than to run insecurely.
**Prevention:** Never use default fallback values for security-critical secrets. Instead, fail securely by explicitly checking for the environment variable and throwing an error on startup if it's missing.
