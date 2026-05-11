## 2024-05-11 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons (like Share, Favorite, Comments) lacked accessible names, making them difficult to use with screen readers. They also lacked `title` tooltips for hover state clarity.
**Action:** Added `aria-label` and `title` to the buttons. Made the labels dynamic based on state (e.g., "Añadir a favoritos" vs. "Quitar de favoritos") and localized to Spanish. Added `aria-expanded` to the comments toggle and `aria-hidden="true"` to the internal `Lucide` icons to avoid redundant screen reader announcements.
