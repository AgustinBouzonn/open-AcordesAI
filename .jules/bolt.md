## 2025-02-18 - App.tsx Render Performance
**Learning:** `App.tsx` uses inline function calls for Route `element` props (e.g., `element={renderFavorites()}`). This causes all view logic (including cache lookups and object creation) to execute on every render of the main App component, regardless of the active route.
**Action:** In future refactors, extract these views into standalone components (e.g., `<Favorites />`) to leverage React's reconciliation and prevent unnecessary execution.
