
## 2024-03-20 - [React Router Render Performance Optimization]
**Learning:** Defining view components inline directly inside the `element` prop of React Router (e.g., `element={renderFavorites()}`) forces React to execute the function on every render of the parent component. This causes expensive side effects, like parsing `localStorage` on every keystroke in an unrelated search input.
**Action:** Always define React Router views as standalone, memoized (`React.memo`) components *outside* of the main component body, and pass down callbacks using `useCallback` to prevent unnecessary re-renders.
