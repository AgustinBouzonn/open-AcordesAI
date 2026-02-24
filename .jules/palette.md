## 2024-05-22 - Replacing Clickable Divs with Buttons
**Learning:** Using `div` with `onClick` for interactive lists (like search results or trending items) creates significant accessibility barriers, as they lack default keyboard focus and screen reader semantics.
**Action:** Replace these patterns with semantic `<button>` elements, ensuring `type="button"`, `w-full`, `text-left`, and explicit focus styles (`focus-visible:ring-2`) are applied to maintain the original layout while restoring native accessibility.
