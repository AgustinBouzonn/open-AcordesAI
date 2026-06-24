## 2025-02-23 - Accessibility for Icon-only buttons
**Learning:** Icon-only buttons (like those for sharing, favoriting, commenting, and rating) lack context for screen readers and can be confusing for some users without hover text tooltips. Adding `aria-label` and `title` attributes solves both issues simultaneously.
**Action:** When adding new icon-only buttons to the UI, ensure they include descriptive, localized (Spanish) `aria-label` and `title` attributes (e.g., `aria-label="Compartir" title="Compartir"`).
