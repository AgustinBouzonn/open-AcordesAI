# Palette's Journal

This journal documents critical UX and accessibility learnings from the AcordesAI project.

## 2024-05-22 - Semantic Interactive Lists
**Learning:** Found trending search items implemented as `div`s with `onClick`. This makes them inaccessible to keyboard users and screen readers.
**Action:** Always implement interactive list items as `<button type="button">` with `w-full text-left` to maintain layout while gaining native accessibility (focus, enter/space activation).

## 2024-05-22 - Icon-Only Buttons
**Learning:** Several icon-only buttons (favorites, comments, font size) lacked accessible names.
**Action:** Ensure every icon-only button has an `aria-label` describing its function, especially when no visible text is present.
