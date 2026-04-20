## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF State Validation in OAuth Callbacks
**Vulnerability:** The OAuth login implementation accepted `state` and `code` parameters but failed to compare the query `state` parameter against the stored `oauth_state` cookie, creating an unmitigated Cross-Site Request Forgery (CSRF) vulnerability. This could allow an attacker to trick a user into logging in as the attacker, potentially exposing data if the app links accounts or has stateful sessions.
**Learning:** During OAuth login flows, it's not enough to simply send a random state value and accept any state value back; the application must independently verify that the state value provided by the external identity provider (IdP) exactly matches the session cookie state value established at the initiation of the flow.
**Prevention:** In every OAuth callback route, extract the state query parameter, parse the request cookies to retrieve the original stored state, and assert that `state === oauthState`. If they mismatch, aggressively reject the authentication request.
