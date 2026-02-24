## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Prompt Injection via Unvalidated Enum
**Vulnerability:** The `instrument` parameter in `getSongData` was directly interpolated into the LLM prompt. While typed as `Instrument`, runtime values were not validated, allowing potential prompt injection if the parameter source was untrusted.
**Learning:** TypeScript types are erased at runtime. Critical security boundaries (like LLM prompts or SQL queries) must have runtime validation for all inputs, even those that seem internal or typed.
**Prevention:** Whitelist valid enum values at runtime and default to a safe value (e.g., 'guitar') if the input does not match.
