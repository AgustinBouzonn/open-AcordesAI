## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-03-02 - Local Storage DoS Prevention
**Vulnerability:** The application was vulnerable to Local Storage exhaustion and potential DoS (crashing) due to uncaught `JSON.parse` exceptions on corrupted `localStorage` data, and missing length limitations on user-submitted comments that could rapidly fill up storage.
**Learning:** Purely client-side applications must treat `localStorage` as untrusted input that can be modified by the user or other scripts. Failing to catch parsing errors on startup data or failing to bound stored data size can brick the app for a user until they manually clear their site data.
**Prevention:** Implement and use a `safeJSONParse` utility that wraps `JSON.parse` in a try-catch and provides a safe fallback. Always enforce strict character limits (e.g., 500 characters) on any user-generated content before persisting it to `localStorage`.
