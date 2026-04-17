## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Enhanced Prompt Injection Defense
**Vulnerability:** Even if using triple quotes, without explicit stripping of control characters or escaping quotes, inputs could still break the prompt constraints. Also, malicious outputs could crash the JSON parser.
**Learning:** Proper LLM sanitization requires multiple layers: input encoding/stripping, rigid prompt structures (like `"""`), and defensive output parsing that falls back gracefully rather than throwing raw errors to users.
**Prevention:** Always implement a dedicated `sanitizeInput` that removes control characters and escapes common markdown/quote delimiters before sending user data to an LLM, and parse responses with a safe fallback method.
