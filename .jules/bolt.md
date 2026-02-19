## 2025-05-18 - App.tsx Re-render Bottleneck
**Learning:** `App.tsx` defines inline functions for `renderHome`, `renderFavorites`, etc., and passes them as function calls to `<Route element={func()} />`. This causes these functions to re-execute on *every* render of `AppContent` (e.g. typing in search bar), leading to unnecessary LocalStorage reads (`JSON.parse`) and VDOM creation even for inactive routes.
**Action:** In future refactors, extract these route handlers into proper React components defined outside `AppContent` to prevent unnecessary execution and improve performance.

## 2025-05-18 - Animation Loop Pattern
**Learning:** The codebase previously used `setInterval` for auto-scrolling, which caused jitter and ignored display refresh rates.
**Action:** Use `requestAnimationFrame` with time-delta calculations for all continuous animations (like auto-scroll) to ensure smooth 60fps motion and battery efficiency (pausing in background tabs).
