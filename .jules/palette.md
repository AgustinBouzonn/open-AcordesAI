## 2026-04-14 - Accessible Icon Buttons
**Learning:** Icon-only buttons for social actions (like Share, Favorite, Comments) lacked screen reader context and visible focus rings. Applying `aria-label`, `title` for tooltips, `focus-visible:ring-2` for keyboard navigation, and `aria-hidden="true"` on Lucide icons ensures proper accessibility in this app's Tailwind-based UI.
**Action:** Always apply `aria-label` (or dynamic labels for stateful buttons), `title`, `focus-visible:ring-2` along with `focus-visible:ring-brand`, and `aria-hidden="true"` on decorative child icons for icon-only buttons.
