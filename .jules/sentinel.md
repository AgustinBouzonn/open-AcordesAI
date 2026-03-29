## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Advanced Prompt Injection Prevention
**Vulnerability:** Weak input sanitization allowed advanced prompt injection by not filtering out specific structural characters (backticks, newlines, tabs) or common injection instructions.
**Learning:** Advanced prompt injection attacks can circumvent basic string escaping by leveraging backticks or control characters, and direct instructional phrases.
**Prevention:** In addition to basic string escaping, use explicit blocklists for common injection keywords (e.g., 'system prompt', 'ignore instructions') and strip structural characters like backticks (`), newlines (\n), and tabs (\t).
