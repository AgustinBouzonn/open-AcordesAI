## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-12 - Local Storage Exhaustion & Client-Side DoS
**Vulnerability:** Unbounded `localStorage` writes (e.g., user comments) and unsafe `JSON.parse` operations could crash the application or exhaust storage quotas, leading to Denial of Service.
**Learning:** Client-side storage is a finite resource. Failing to handle `QuotaExceededError` or parse errors creates brittle applications that can break permanently for users with corrupted data.
**Prevention:** Always wrap `localStorage` access in try-catch blocks (fail securely), enforce strict size limits on stored data, and use safe parsing utilities.
