## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2024-05-24 - Prevent LocalStorage DoS and Predictable IDs
**Vulnerability:** The application was vulnerable to LocalStorage Denial of Service (DoS) due to unbounded comment lengths being saved, and it used predictable IDs (`Date.now().toString()`) for user comments.
**Learning:** Client-side storage like `localStorage` has limited capacity. Unbounded user inputs saved locally can easily exhaust this quota and break the application for the user. Additionally, predictable IDs based on timestamps can lead to conflicts or enable enumeration attacks if synced later.
**Prevention:** Always enforce a maximum length limit on user inputs both on the client-side (`maxLength`) and before saving/processing (`text.slice(0, 500)`). Use `crypto.randomUUID()` instead of `Date.now()` to generate unique and unpredictable identifiers.