
## 2024-05-24 - React Router Inline Functions Anti-Pattern
**Learning:** In React Router v6, defining inline functions directly in the `element` prop of a `<Route>` (e.g., `<Route element={renderFavorites()} />`) is a severe performance anti-pattern. Every time the parent component (`AppContent`) re-renders—such as when a user types in a search bar—all inline view functions execute synchronously, even for inactive routes. This can trigger expensive operations like `localStorage` reads on every keystroke.
**Action:** Always extract route views into standalone React components (e.g., `<FavoritesView />`) defined *outside* the parent component so that React Router can properly mount/unmount them and prevent unnecessary execution on inactive routes.
