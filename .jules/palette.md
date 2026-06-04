## 2024-05-24 - Accessibility for Expandable UI Toggles
**Learning:** Buttons that toggle the visibility of expandable UI sections (like comments) must use the `aria-expanded` attribute with the current boolean state to properly convey the visibility status to screen readers, instead of just an `aria-label`.
**Action:** Always include `aria-expanded={isVisible}` alongside `aria-label` when creating toggles for collapsible content areas.
