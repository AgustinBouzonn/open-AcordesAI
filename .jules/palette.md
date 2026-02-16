# Palette's Journal - Critical Learnings

## 2024-03-24 - Icon-only buttons accessibility
**Learning:** Icon-only buttons (like Favorites, Comments) were completely invisible to screen readers, creating a major accessibility gap.
**Action:** Always add `aria-label` and `title` to icon-only buttons. Consider `aria-pressed` for toggle states like Instruments.
