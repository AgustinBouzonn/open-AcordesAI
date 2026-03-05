## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-18 - [Insecure Deserialization & Unhandled JSON Parsing]
**Vulnerability:** The codebase contained numerous instances of `JSON.parse` directly parsing data from `localStorage` and AI responses without try/catch blocks.
**Learning:** This could lead to a denial-of-service (crashing the application) or unhandled runtime exceptions if local storage becomes corrupted, modified by a user, or if the LLM hallucinated a non-JSON string.
**Prevention:** Introduced a `safeJSONParse<T>` utility in `utils/security.ts` that catches parsing errors and returns a safe fallback/default value. All vulnerable `JSON.parse` instances have been replaced.
