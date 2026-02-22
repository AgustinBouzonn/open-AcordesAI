## 2025-05-18 - Interactive Lists as Buttons
**Learning:** The application heavily used `div` with `onClick` for interactive lists (Trending, Search Results, Favorites, History), which made them inaccessible to keyboard users.
**Action:** Always use `<button>` elements for interactive list items, applying `w-full text-left` to maintain the card-like layout while gaining native accessibility features.
