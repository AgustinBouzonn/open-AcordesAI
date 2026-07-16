## 2025-03-05 - Fix missing state validation in OAuth callback (CSRF)
**Vulnerability:** The OAuth callback endpoint (`/api/auth/oauth/:provider/callback`) was missing validation of the `state` parameter against the initial `OAUTH_COOKIE`. It was only checking for the existence of `state` but not verifying it matched what the server set for the user.
**Learning:** OAuth flows require validation of the `state` parameter to prevent CSRF attacks. Even if the state is generated and sent to the client, it must be rigorously checked on the callback to ensure it corresponds to the current session flow.
**Prevention:** Always validate `state` or similar CSRF tokens using a signed/secure cookie when implementing social logins or callback-based flows. Do not just check for existence.
