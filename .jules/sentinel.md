## 2025-03-08 - Added CSRF validation to OAuth Callback
**Vulnerability:** Missing state parameter validation in OAuth callback endpoint allowed Cross-Site Request Forgery (CSRF).
**Learning:** The `state` parameter generated during the initial OAuth flow and stored in the `OAUTH_COOKIE` was not being cross-referenced with the `state` parameter returned by the OAuth provider upon callback.
**Prevention:** Always compare the received `state` parameter against the stored state before exchanging the code for an access token to ensure the request originated from a legitimate application session.
