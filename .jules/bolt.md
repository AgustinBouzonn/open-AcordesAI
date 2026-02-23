## 2024-05-23 - Render Function Anti-Pattern in React Router
**Learning:** Avoid using inline render functions in `element` prop of React Router (e.g., `element={renderFavorites()}`). This causes the function to execute on every render of the parent component, even if the route is not active. Use component references (e.g., `element={<Favorites />}`) instead to leverage React's reconciliation and avoid unnecessary computations.
**Action:** Always extract route content into standalone components to ensure they only render when the route matches.
