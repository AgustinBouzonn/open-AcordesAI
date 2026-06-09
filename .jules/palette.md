## 2024-06-09 - Accessible Expandable Buttons
**Learning:** Expanding/collapsing sections like the Comments section should always use the `aria-expanded` boolean attribute to accurately communicate their current visibility state to screen readers, in addition to descriptive `aria-label`s.
**Action:** Always add `aria-expanded={booleanVariable}` alongside `aria-label` when making accessibility improvements to toggleable/expandable UI sections.
