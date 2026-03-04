## 2024-03-04 - Accessible Icon-Only Buttons
**Learning:** Icon-only buttons in the application require localized Spanish `aria-label` and `title` attributes, as well as explicit `type="button"` and `focus-visible` styles to ensure proper screen reader support, tooltip visibility, form behavior prevention, and keyboard navigation.
**Action:** Always add `aria-label`, `title`, `type="button"`, and `focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none` to icon-only buttons in the future.
