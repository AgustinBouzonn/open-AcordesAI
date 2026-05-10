## 2024-05-24 - Accessible Icon-Only Buttons in Lists
**Learning:** Icon-only action buttons in list elements (like reordering, renaming, and deleting items) lack accessible labels by default and their embedded SVGs can cause redundant announcements. Tooltips aren't sufficient for screen readers.
**Action:** Always add aria-label attributes to icon-only buttons, add aria-hidden="true" to their child SVG icons, and provide standard title tooltips for visual users.
