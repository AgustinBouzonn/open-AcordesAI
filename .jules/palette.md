## 2024-05-24 - Accessibility for Icon-only Buttons
**Learning:** Icon-only buttons (like Share, Favorite, Comments, and Rating Stars) lack accessible text for screen readers. Using titles helps but `aria-label` provides the explicit accessible name.
**Action:** Always provide `aria-label` and `title` to icon-only buttons in the UI. Ensure focus styles like `focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none` are added for keyboard navigators, and add `aria-hidden="true"` to the decorative inner icons to avoid redundant screen reader announcements.
