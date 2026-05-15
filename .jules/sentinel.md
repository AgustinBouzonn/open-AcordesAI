## 2026-02-07 - Prompt Injection in AI Services
**Vulnerability:** User inputs (search queries, song IDs) were directly interpolated into LLM prompts without sanitization or delimitation, allowing potential prompt injection.
**Learning:** In AI-centric applications, "Prompt Injection" is similar to SQL Injection. Malicious inputs can override system instructions if not properly delimited.
**Prevention:** Always sanitize inputs to remove control characters and use robust delimiters (like triple quotes) to clearly separate user data from instructions in the prompt.

## 2026-02-07 - Missing CSRF Protection in OAuth Callbacks
**Vulnerability:** The OAuth callback handlers (`/api/auth/oauth/:provider/callback`) lacked validation of the `state` parameter against the stored state in the user's cookies, allowing an attacker to launch a Cross-Site Request Forgery (CSRF) attack by forcing a victim to log in to the attacker's account.
**Learning:** Even when using standard OAuth flows and secure HTTP-only cookies, the callback route itself is vulnerable if it blindly accepts an authorization code without verifying the request originated from the same user session that started the flow.
**Prevention:** Always generate a unique, random `state` parameter when starting an OAuth flow, store it in a secure cookie, and strictly validate that the incoming `state` in the callback matches the stored cookie value before exchanging the code for a token.
