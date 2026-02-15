## 2025-05-21 - [React Router Render Performance]
**Learning:** Defining route elements as inline function calls (e.g., `element={renderHome()}`) executes the render logic on *every* parent re-render, even if the route is not active. This is especially costly when the render function performs synchronous storage reads or heavy computations.
**Action:** Always extract route views into standalone components and pass them as JSX elements (e.g., `element={<Home />}`) to leverage React's reconciliation and avoid unmounted component execution.
