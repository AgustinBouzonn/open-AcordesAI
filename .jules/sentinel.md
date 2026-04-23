## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2026-04-08 - Prompt Injection via Instrument Variable
**Vulnerability:** The instrument variable in the AI service was not sanitized and directly interpolated into the prompt. This allowed for prompt injection.
**Learning:** All inputs that are interpolated into prompts, even those that seem harmless or are expected to be from a restricted set, must be sanitized. Do not assume any input is safe without explicit sanitization.
**Prevention:** Apply `sanitizeInput` to all variables that are placed inside prompt strings, regardless of their origin.
