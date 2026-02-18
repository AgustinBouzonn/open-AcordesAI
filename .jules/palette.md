# Palette's Journal

This file documents critical UX and accessibility learnings from the AcordesAI project.

## 2024-05-22 - Semantic Interactive Elements
**Learning:** Using `div` elements for interactive lists (like trending searches) creates a barrier for keyboard users and screen readers, as they lack default focus states and role information.
**Action:** Always use `<button>` elements for interactive items in lists, ensuring `type="button"` to prevent form submission, and add `w-full text-left` classes to maintain layout consistency.
