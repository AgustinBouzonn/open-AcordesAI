## 2024-06-12 - Accessibility on Icon Action Buttons
**Learning:** Icon-only action buttons in the SongViewer component (Share, Favorites, Comments) lacked ARIA attributes, creating accessibility barriers for screen readers and missing tooltips for desktop users.
**Action:** When adding or updating icon-only buttons, always ensure an `aria-label` and `title` are present in the appropriate locale. Additionally, use state-driven attributes like `aria-expanded` and dynamic labels (e.g., "Añadir a favoritos" vs "Quitar de favoritos") to convey the current interactive state.
