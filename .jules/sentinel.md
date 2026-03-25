## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2025-03-25 - Fail Securely on JSON Parsing
**Vulnerability:** Unhandled Exceptions during `JSON.parse` (DoS / Crash risk). Directly parsing AI responses or `localStorage` values using `JSON.parse` can cause application crashes or white-screens if the input is malformed, corrupted, or deliberately manipulated (e.g. prompt injection causing the AI to return invalid JSON, or manual tampering with LocalStorage).
**Learning:** `JSON.parse` will throw a synchronous error if the input is not valid JSON. If not wrapped in a `try...catch` block (or if the catch block does not provide a usable fallback state), this will bubble up and crash the application context where it was called.
**Prevention:** Implement and use a `safeJSONParse` utility that wraps `JSON.parse` in a `try...catch` block and requires a generic fallback value. All untrusted or external data sources (AI responses, `localStorage`) should be parsed through this utility to ensure the application fails securely and gracefully.
