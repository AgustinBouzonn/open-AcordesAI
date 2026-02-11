## 2025-05-20 - React Router Inline Function Performance
**Learning:** Passing inline function calls (e.g. `element={renderFavorites()}`) to React Router `Route` components causes the function to execute on *every* parent render, regardless of the active route. This leads to unnecessary computations and synchronous storage access.
**Action:** Always extract route components to standalone components or wrapped components (e.g. `<Favorites />`) so they only mount/render when the route is active.
