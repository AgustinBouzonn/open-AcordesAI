## 2025-02-12 - Icon-only buttons accessibility pattern
**Learning:** Icon-only buttons in the `SongViewer` (Favorite, Comments, Font Size) lacked accessible names, making them unusable for screen reader users and potentially confusing for mouse users without tooltips.
**Action:** Always add `aria-label` and `title` to icon-only buttons. Use `aria-pressed` for toggle buttons to communicate state changes effectively.
