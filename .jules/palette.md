# Palette's Journal - Critical UX/A11y Learnings

This journal tracks specific accessibility patterns and UX insights discovered in this codebase.

## 2025-05-20 - Icon-Only Button Patterns
**Learning:** This codebase heavily relies on icon-only buttons for key interactions (favorites, comments, font controls) without consistently providing `aria-label` or `title` attributes.
**Action:** When adding new icon-only controls, always enforce the pattern of including both `aria-label` (for screen readers) and `title` (for tooltip/hover) to ensure universal accessibility.
