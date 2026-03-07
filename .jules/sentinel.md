## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-03-07 - Unbounded Local Storage Exploitation (DoS)
**Vulnerability:** The application's comment feature allowed users to submit arbitrarily large text payloads which were directly saved to `localStorage`, exposing the client to a Denial of Service (DoS) attack via storage quota exhaustion.
**Learning:** Client-side storage (like `localStorage` or `IndexedDB`) has strict quotas (typically ~5MB). If user inputs are unbounded, an attacker can easily fill this quota, breaking core application functionality that relies on storage.
**Prevention:** Always implement explicit maximum length constraints on text inputs (e.g., `<textarea maxLength={500}>`) AND enforce truncation on the client-side data handling functions before saving to storage to prevent large payloads from exhausting the storage limit.
