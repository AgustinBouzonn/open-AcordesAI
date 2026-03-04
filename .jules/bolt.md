## 2026-03-04 - Prevent route render execution on inactive routes
**Learning:** Using function calls like `element={renderHome()}` in React Router's `<Route>` props evaluates the entire view's render logic, including heavy operations like local storage reads and full tree creation, on every parent component render, regardless of whether the route is active.
**Action:** Always define route views as proper React components outside the parent and pass them as JSX elements (e.g., `element={<HomeView />}`) so React Router can defer rendering until the route is active.
