## 2026-03-24 - [Accessible Icon-Only Buttons in SongViewer]
**Learning:** Icon-only buttons (like Favorite, Comments, and Font Size controls) must include an `aria-label` (or `title`), an explicit `type="button"`, and `focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none` classes to ensure keyboard navigability and clear screen reader announcements.
**Action:** When adding new icon-only controls, ensure to apply these accessibility attributes and focus styles consistently, rather than relying solely on visual icons or `aria-hidden` on the SVG.
