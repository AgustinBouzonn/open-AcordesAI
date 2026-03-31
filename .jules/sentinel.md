## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-05-23 - Hardcoded Secrets Fallback Values
**Vulnerability:** Important secrets and credentials (like JWT_SECRET and DATABASE_URL) were using hardcoded fallback values if environment variables were missing. This could lead to a severe security vulnerability where the backend silently starts and uses the known fallback value in production or staging environments.
**Learning:** Hardcoded fallback values for secrets are dangerous because they can mask misconfigurations and provide an attacker with a known key to sign malicious JWT tokens or access the database.
**Prevention:** Always fail securely. If an environment variable is required for security (like a secret or a database URL), the application should explicitly throw an initialization error and refuse to start, rather than silently falling back to a default value.
