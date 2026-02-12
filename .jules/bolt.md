## 2025-02-15 - React Router Element Performance Trap
**Learning:** Defining routes with function calls (e.g. `element={renderHome()}`) executes the render logic on EVERY parent render, causing performance issues.
**Action:** Always use component instances in `element` props (e.g. `element={<Home />}`) so React only mounts/renders them when the route matches.

## 2025-02-15 - Synchronous Storage Access in Render
**Learning:** Reading from `localStorage` (even via helper functions) synchronously inside a render function blocks the main thread and runs on every re-render of the parent.
**Action:** Move data fetching inside components (e.g. `useEffect` or component body if cheap but conditional) so it only runs when the component is mounted.
