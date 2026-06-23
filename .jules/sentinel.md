## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-04-14 - Prompt Injection in Song Generation
**Vulnerability:** User inputs (`title`, `artist`, `instrument`) were directly passed to `backend/src/services/aiService.ts` when generating chords, risking prompt injection that could alter AI model instructions or extract information.
**Learning:** Even internal API inputs passed down to LLM functions can act as injection vectors if the prompt structure treats them as executable instructions rather than safe data.
**Prevention:** Implement and enforce a central `sanitizeInput` utility that strips control characters and escapes block delimiters (like ``` and """) before embedding any user-supplied strings into LLM prompts.
