## 2024-05-18 - Accessibility for State-Toggling Icon-Only Buttons
**Learning:** Icon-only toggle buttons (like favorites or comments) require dynamic `aria-label` and `title` attributes that reflect the current state or the action that will happen. For UI sections that expand/collapse, `aria-expanded` is essential to convey visibility status to screen readers.
**Action:** Always apply dynamic ARIA attributes reflecting state and `aria-hidden="true"` on inner decorative elements for icon-only toggles to prevent redundant announcements.
