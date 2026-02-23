## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Prompt Injection via Enum Parameter
**Vulnerability:** The `instrument` parameter in `getSongData` was typed as `Instrument` but not validated at runtime, allowing arbitrary strings to be interpolated into the LLM prompt.
**Learning:** TypeScript types are erased at runtime. Client-side validation is necessary for parameters that are used in sensitive contexts (like prompts) even if they are typed as strict unions.
**Prevention:** Validate enum-like parameters against an allowlist (`VALID_INSTRUMENTS.includes(param)`) before using them in prompts or sensitive logic.
