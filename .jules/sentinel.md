## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-03-19 - Expanded Prompt Injection Defense
**Vulnerability:** Input sanitization in `utils/security.ts` only removed quotes and backslashes, leaving the system vulnerable to advanced prompt injections using backticks, newlines, and tabs, as well as explicit instructional overrides.
**Learning:** Basic character stripping is insufficient. Attackers can use whitespace and backticks to break out of delimiters. Additionally, simple heuristic checks for common attack patterns provide a useful layer of defense-in-depth.
**Prevention:** Remove backticks, newlines, and tabs in sanitization. Add a heuristic check that redacts inputs containing obvious keywords like "system prompt" or "ignore instructions".
