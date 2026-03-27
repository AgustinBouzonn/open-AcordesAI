## 2026-03-27 - Accessible Controls in Dark Themes
**Learning:** Icon-only buttons in dark modes often lack sufficient visible focus indicators and explicit labels, causing accessibility and navigation barriers for keyboard and screen reader users. Instrument toggle selectors also require explicit `role="group"` and `aria-pressed` states.
**Action:** Always wrap grouped toggle buttons in a container with `role="group"` and use `aria-pressed` on individual toggles. Ensure all icon-only buttons include `aria-label`, `title`, `type="button"`, and robust `focus-visible` styling.
