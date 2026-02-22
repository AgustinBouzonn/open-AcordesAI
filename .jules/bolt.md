## 2024-05-23 - React Router V6 Performance Anti-Pattern
**Learning:** Defining route elements as inline function calls (e.g., `element={renderHome()}`) causes the entire component tree for that route to be rebuilt on every render of the parent, even for inactive routes.
**Action:** Always extract route views into separate components and pass them as JSX elements (e.g., `element={<Home />}`). This ensures proper component lifecycle management and prevents unnecessary re-renders of inactive views.
