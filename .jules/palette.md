## 2026-09-30 - Accessible Icon Buttons with Dynamic Badges
**Learning:** When adding `aria-label` to icon buttons that include a visual badge (like comment counts), the `aria-label` completely overrides the inner text for screen readers, meaning the badge count is silently lost to screen reader users if not handled properly.
**Action:** Always dynamically include the count within the `aria-label` itself (e.g., using string concatenation) and apply `aria-hidden="true"` to the visual badge element to prevent redundant reading if screen readers ever change behavior.
