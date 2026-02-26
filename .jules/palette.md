## 2025-05-15 - Converting List Items to Buttons
**Learning:** When converting interactive `div` list items to `button` elements for accessibility, `w-full` and `text-left` are essential to preserve the original flex/grid layout and text alignment, as buttons default to `inline-block` and `text-center`.
**Action:** Always include `w-full text-left` when refactoring list-based interactions to buttons.
