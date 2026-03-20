## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - LocalStorage Denial of Service (DoS) and Input Limits
**Vulnerability:** The application stored user comments in LocalStorage without any length restrictions, allowing a user to input megabytes of text until `localStorage` quotas were exceeded, potentially breaking the app.
**Learning:** Client-side storage mechanisms are easily overwhelmed by unconstrained user inputs. We must apply length limits to any string inputs saved locally.
**Prevention:** Always enforce a `maxLength` on `<textarea>` and `<input>` elements on the client side, and strictly truncate the strings server-side (or right before writing to LocalStorage).
