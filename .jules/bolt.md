## 2025-05-18 - React Router Element Prop Anti-Pattern
**Learning:** Passing a function call (e.g., `element={renderFavorites()}`) to React Router's `element` prop causes the function to execute on *every* parent render, leading to severe performance degradation if the function performs synchronous IO or expensive computations.
**Action:** Always extract route content into separate components and pass them as JSX elements (e.g., `element={<Favorites />}`).
