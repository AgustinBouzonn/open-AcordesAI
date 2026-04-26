## 2026-04-26 - OAuth CSRF Vulnerability via Missing State Validation
**Vulnerability:** OAuth callback routes did not validate the `state` query parameter against the stored `OAUTH_COOKIE` (`oauth_state`), making the application vulnerable to Cross-Site Request Forgery (CSRF). An attacker could link their own social account to a victim's session.
**Learning:** The OAuth2 `state` parameter is specifically designed to prevent CSRF during the login flow. Merely passing the state to the provider is insufficient; the application must verify the returned state matches the original one stored in the user's session/cookie before exchanging the code for a token.
**Prevention:** Always extract the stored state from the session/cookie in the OAuth callback and enforce a strict equality check (`state === storedState`) against the returned `state` query parameter.
## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
