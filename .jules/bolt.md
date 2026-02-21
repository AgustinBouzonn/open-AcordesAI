## 2025-02-18 - Inline Render Functions in Routes
**Learning:** Defining route elements as inline function calls (e.g., `element={renderHome()}`) executes the render logic on *every* parent render, regardless of the active route. This causes unnecessary computation and re-renders for inactive views.
**Action:** Always extract route views into stable components (e.g., `element={<Home />}`) so they only render when the route matches.
