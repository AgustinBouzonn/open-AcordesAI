## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Prompt Injection via Unvalidated TypeScript String Interpolation
**Vulnerability:** In `services/geminiService.ts`, the `instrument` parameter (typed as `Instrument` enum) was directly interpolated into the LLM prompt (`Provide the ${instrument} chords...`) and used as a key in the returned object without runtime validation.
**Learning:** TypeScript type assertions are erased at compilation. External inputs masquerading as valid enums can be arbitrary strings at runtime. If these unvalidated strings are interpolated directly into prompts, they create a critical prompt injection vulnerability, allowing malicious users to alter the LLM's instructions.
**Prevention:** Always explicitly validate parameters that come from external sources or form runtime boundaries, especially before using them in LLM prompts or as object keys. Validate against an allowed list and provide a safe fallback.
