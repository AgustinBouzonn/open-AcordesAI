## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2025-03-08 - Client and Server Side Validation for Data Length
**Vulnerability:** The application was not restricting the length of comments allowing arbitrary length input to be stored in localStorage. This could lead to a Denial of Service (DoS) vulnerability by exhausting the user's localStorage limit.
**Learning:** Enforce length restrictions both on the client side (e.g. `maxLength` on inputs) to improve UX and prevent sending large requests, and on the storage/server side (e.g. `slice(0, MAX_LENGTH)` or DB constraints) to guarantee security against maliciously crafted requests that bypass the UI.
**Prevention:** Always add sensible limits to user input length on both the frontend elements and the backend/storage processing layers.
