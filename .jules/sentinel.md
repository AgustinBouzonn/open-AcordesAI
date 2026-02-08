## 2026-02-08 - Prompt Injection Mitigation
**Vulnerability:** User input was directly interpolated into LLM prompts without sanitization, allowing potential prompt injection attacks.
**Learning:** Even in non-critical applications, untrusted input used in generative AI prompts must be treated as code injection vectors.
**Prevention:** Implement strict input sanitization (trimming, length limits, character allow-listing or stripping) before constructing prompts. Avoid direct string interpolation of raw user input.
