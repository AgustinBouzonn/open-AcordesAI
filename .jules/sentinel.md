## 2024-05-23 - Prevent Local Storage DoS via Comment Length Limit
**Vulnerability:** The application lacked input length limits on user-submitted comments, allowing arbitrarily long strings to be saved to `localStorage`.
**Learning:** This exposes the application to a Denial of Service (DoS) attack where a malicious user could exhaust the browser's `localStorage` quota, causing the application to fail when saving future data.
**Prevention:** Implement defense-in-depth by adding a `maxLength` attribute to client-side input elements (`<textarea>`) and strictly truncating the input string on the service/storage layer before saving.
