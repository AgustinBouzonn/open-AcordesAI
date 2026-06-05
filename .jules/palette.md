## 2025-03-03 - Missing accessibility attributes on icon-only toggle buttons
**Learning:** Found an accessibility issue pattern specific to this app's components: icon-only buttons (like rating stars, share, favorites, and comments toggles) were missing `aria-label`, `title` attributes, and state indications like `aria-expanded`.
**Action:** Add `aria-label` and `title` to clarify function, and use `aria-expanded` (with boolean state values) on sections that can be toggled to improve the screen reader experience.
