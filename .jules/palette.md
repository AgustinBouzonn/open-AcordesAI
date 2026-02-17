# Palette's Journal

## 2026-02-17 - Interactive Lists Accessibility
**Learning:** Interactive lists implemented as `div`s with `onClick` exclude keyboard users and screen readers from accessing key features like trending searches.
**Action:** Always use `<button>` for interactive list items, adding `type="button"`, `aria-label`, and visible focus states (e.g., `focus:ring-2`).
