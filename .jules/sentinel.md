## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - CSRF Vulnerability in OAuth Callbacks
**Vulnerability:** The OAuth callback route did not validate the `state` parameter returned by the OAuth provider against the original `state` value stored in the user's cookies. This missing verification opened up the application to Cross-Site Request Forgery (CSRF) attacks, potentially allowing attackers to associate arbitrary accounts with the victim's session.
**Learning:** Even if `state` is generated during the start of the OAuth flow and sent to the provider, if it's not strictly verified on the callback route, its protective value is nullified. The callback must compare the returned `state` with the stored initial value.
**Prevention:** Always extract the original state from cookies or session storage on the callback route and strictly match it against the state query parameter from the provider before proceeding with the token exchange.
