## 2024-05-15 - Missing OAuth CSRF Validation
**Vulnerability:** The OAuth callback endpoint (`/oauth/:provider/callback`) extracted the `state` parameter from the query string but failed to validate it against the `oauth_state` cookie that was set during the initial redirect.
**Learning:** This missing validation allowed CSRF attacks where an attacker could forge an OAuth callback request and trick a victim into linking their account to an attacker-controlled social identity.
**Prevention:** Always explicitly read the original state cookie (e.g., using `parseCookies`) and strictly validate that both the query parameter and the cookie exist and match exactly before exchanging the OAuth token.
