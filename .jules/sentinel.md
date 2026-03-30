## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2025-03-01 - [Remove hardcoded fallback secrets]
**Vulnerability:** Hardcoded fallback values for JWT_SECRET and DATABASE_URL in the backend allow attackers to reconstruct valid tokens and gain full system access if the intended environment variables are missing.
**Learning:** Hardcoding fallback secrets (like `process.env.JWT_SECRET || 'changeme'`) in the code is dangerous as it allows the system to fail "open" and use predictable keys rather than fail securely.
**Prevention:** Avoid providing default or fallback values for secrets. Instead, enforce the requirement of environment variables during application startup, throwing an error and refusing to start if they are missing.
