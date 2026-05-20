## 2024-05-20 - Accessible State-Toggling Icon Buttons
**Learning:** Icon-only buttons that toggle states (like favorites or comments) require dynamic `aria-label` and `title` attributes that reflect their current state or the action that will happen. Additionally, child icons should be hidden from screen readers using `aria-hidden="true"` to prevent redundant announcements.
**Action:** Always apply dynamic ARIA labels/titles to state-toggling icon buttons and ensure child decorative elements have `aria-hidden="true"`.
