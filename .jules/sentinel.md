## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.
## 2024-05-18 - Missing OAuth CSRF State Validation
**Vulnerability:** The OAuth callback endpoints did not validate the `state` query parameter against the `oauth_state` cookie that was set during the initial OAuth redirect. This allowed Cross-Site Request Forgery (CSRF) attacks where an attacker could link their own provider account to a victim's session.
**Learning:** State parameter was being read from the query string but not compared to the stored cookie, bypassing the entire purpose of the `state` parameter. The project does not use `cookie-parser`, so cookies need to be manually parsed using `parseCookies` utility.
**Prevention:** Always explicitly parse cookies and strictly compare the incoming `state` parameter against the stored `oauth_state` cookie before executing the token exchange. Ensure both the parameter and cookie exist before comparing.
