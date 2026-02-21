## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Indirect Prompt Injection via Configuration Parameters
**Vulnerability:** The `instrument` parameter in `getSongData` was interpolated into the LLM prompt without validation, assuming it would always be a valid enum value. This allowed potential prompt injection if called with malicious strings.
**Learning:** Even parameters that appear to be internal enums or configuration options must be validated against an allow-list before being used in AI prompts, as they can be manipulated (e.g. via API calls or client-side modification).
**Prevention:** Use strict allow-lists (whitelisting) for all enum-like inputs before interpolating them into prompts. Default to a safe value if validation fails.
