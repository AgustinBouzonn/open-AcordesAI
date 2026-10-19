## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-10-19 - OAuth CSRF y vinculación por email no verificado (RESUELTO)
**Vulnerability:** El callback OAuth no comparaba `state` con la cookie `oauth_state` (login CSRF), y se aceptaban emails no verificados (GitHub `list[0]`, Google sin `email_verified`), permitiendo vincular la cuenta de otra persona vía `upsertOAuthUser`.
**Learning:** Si se vinculan cuentas por email, el email del proveedor tiene que estar verificado. Sentinel abrió ~20 PRs duplicados de este hallazgo: antes de abrir un PR, revisar si ya hay uno abierto o si el fix ya está en `main`.
**Prevention:** `backend/test/routes/oauth.test.ts` cubre state ausente/distinto y emails no verificados.
