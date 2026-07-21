## 2025-02-23 - Missing CSRF State Validation in OAuth Flow
**Vulnerability:** The OAuth flow generated a `state` parameter and saved it to a cookie during initialization, but failed to validate this parameter when the OAuth provider called back to the application. This left the application vulnerable to Login CSRF, where an attacker could link their own provider account to the victim's session.
**Learning:** Even if a state token is generated and passed to the provider, it provides zero security if it isn't strictly validated upon return.
**Prevention:** Always validate OAuth `state` parameters strictly against the stored state (e.g., in a cookie or session) before exchanging the authorization code for an access token.
