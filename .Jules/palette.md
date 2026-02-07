## 2026-02-07 - Icon-only Buttons
**Learning:** Found multiple icon-only buttons (Favorite, Comments, Font Size) in `SongViewer` lacking accessible names. Using both `aria-label` for screen readers and `title` for mouse users provides redundant but helpful context.
**Action:** Always audit `SongViewer` and similar components for icon buttons and ensure they have descriptive labels.
