## 2024-05-24 - [A11y Redundancy in Decorative Icons]
**Learning:** Adding `aria-label` to decorative icons (like Lucide React icons next to buttons) can create redundant or confusing screen reader output if the adjacent interactive elements (buttons) are already properly labeled.
**Action:** When adding accessibility to control groups, focus on labeling the interactive `<button>` elements with `aria-label` and `title`. For non-interactive, visual-only icons within or adjacent to these groups, use `aria-hidden="true"` to hide them from screen readers and keep the auditory experience clean.
