## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** The application frequently uses icon-only buttons (like Heart, MessageSquare, Plus/Minus) without accessible labels, making them unusable for screen reader users and confusing for mouse users who don't understand the icon.
**Action:** Always add `aria-label` and `title` attributes to any button that relies solely on an icon for its visual affordance. Ensure the label text is localized (Spanish in this case).
