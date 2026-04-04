## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-08 - Secure LLM Prompt Generation
**Vulnerability:** User inputs (title, artist) were directly concatenated into the AI prompt for generating chords without proper sanitization, allowing potential prompt injection.
**Learning:** Even internal API workflows that query AI models can be disrupted or bypassed if inputs contain injection payloads (e.g. "ignore previous instructions").
**Prevention:** Implement an input sanitization utility (`sanitizeInput`) that truncates inputs, strips structural control characters, and checks against blocklists before passing the data to AI prompt builders.
