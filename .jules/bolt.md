
## 2025-03-02 - React Router Route Render Optimization
**Learning:** In `App.tsx`, placing inline functions or elements directly in the `element` prop of React Router components (`<Route path="..." element={renderHome()} />`) can cause those functions to execute on every re-render of the parent component, even if the route is inactive. In this case, `getFavoriteSongsFull()` and `getHistorySongsFull()` were being executed unnecessarily on every keystroke in the search bar.
**Action:** Extract inline render functions into completely separate React components defined outside the parent component (`HomeView`, `SearchView`, etc.) and pass state/functions as props. This allows React to properly memoize and prevents execution of heavy logic for inactive routes.
