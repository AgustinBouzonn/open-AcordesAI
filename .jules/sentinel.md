## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-03-18 - LocalStorage DoS via Unbounded Comments
**Vulnerability:** The application allowed users to submit comments of unlimited length, which were stored directly in `localStorage` without truncation. A malicious or careless user could quickly exhaust the browser's 5MB `localStorage` limit, causing a Denial of Service (DoS) for the entire application state (favorites, history, cache).
**Learning:** Client-side storage mechanisms like `localStorage` are vulnerable to DoS attacks if user input is not strictly bounded. The impact is significant for offline-first or PWA applications that rely heavily on local storage.
**Prevention:** Enforce input length limits both client-side (e.g., `maxLength={500}` on textareas) and server-side/storage-side (truncating input using `text.slice(0, 500)` before saving) to prevent storage exhaustion.
