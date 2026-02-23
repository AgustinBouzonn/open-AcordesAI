## 2024-05-24 - Interactive Cards as Buttons
**Learning:** Using `div` elements with `onClick` for interactive cards (like search results or favorites) creates significant accessibility barriers, as they lack native keyboard support and semantic meaning for screen readers.
**Action:** Always implement interactive cards as `<button type="button">` elements with `w-full text-left` to maintain layout, and ensure `focus-visible` styles are applied for keyboard navigation. Add `aria-label` if the card content is complex.
