## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Bypassing TypeScript Enums in Client-Side Prompts
**Vulnerability:** The `instrument` parameter was typed as an Enum/Union in TypeScript, but since the application runs purely client-side, attackers could bypass this at runtime to inject arbitrary instructions into the system prompt (e.g., changing the instrument to a malicious command).
**Learning:** TypeScript types are erased at runtime. When passing parameters directly into an LLM prompt from the client, rely on strict runtime allowlists, not just static typing.
**Prevention:** Validate all string interpolations against explicit arrays (e.g., `validInstruments.includes(input)`) before placing them in the prompt.
