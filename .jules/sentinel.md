## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-02-14 - Prompt Injection via Unvalidated Parameter Interpolation
**Vulnerability:** The `instrument` parameter was directly interpolated into the LLM prompt in `getSongData` without runtime validation. Even with TypeScript types, runtime values could be anything, allowing prompt injection if a malicious string was passed.
**Learning:** TypeScript type assertions are erased at compilation. Any variable interpolated into an LLM prompt must be explicitly validated at runtime, especially if it's expected to be a specific enum or string union type.
**Prevention:** Always use a runtime allowlist (e.g., `['guitar', 'ukulele', 'piano'].includes(instrument)`) to validate input before interpolating it into prompts. Apply strict sanitization (removing backticks, newlines, tabs) and blocklist checking for string inputs.
