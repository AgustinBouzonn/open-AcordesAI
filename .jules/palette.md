# Palette's Journal

This journal tracks critical UX and accessibility learnings for the AcordesAI project.

## 2024-03-24 - Interactive List Accessibility
**Learning:** The application consistently uses `div` elements with `onClick` handlers for interactive lists (Trending Searches, Search Results, Favorites). This pattern excludes keyboard users as these elements are not focusable and lack keyboard event handlers.
**Action:** Future refactors must convert these `div` elements to `<button>` elements to ensure native keyboard accessibility and semantic correctness.
