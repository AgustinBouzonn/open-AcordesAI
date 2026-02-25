## 2025-05-23 - Interactive List Accessibility
**Learning:** Common pattern of using `div` with `onClick` for list items (Trending, History, Favorites) breaks keyboard accessibility. Using `button` with `w-full text-left` and refactoring inner block elements (`h3`, `p`) to `span` preserves layout while restoring semantics.
**Action:** When converting list items to buttons, always ensure inner block elements are replaced with `span` + display utility classes to maintain valid HTML.
