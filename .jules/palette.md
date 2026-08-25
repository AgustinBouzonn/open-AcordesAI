## 2024-05-24 - Dynamic ARIA labels for icon buttons with badges
**Learning:** When adding an `aria-label` to a button that contains a visible count/badge, the `aria-label` completely overrides the inner text for screen readers.
**Action:** You must dynamically include the count in the `aria-label` itself (e.g., `aria-label={"Comments (" + count + ")"}`), in addition to applying `aria-hidden="true"` to the badge.
