## 2024-11-20 - Adding dynamic aria-labels to buttons with inner badges
**Learning:** When adding `aria-label` to a button that contains a visual badge (like a comment count), the `aria-label` overrides the inner text for screen readers. The screen reader will read the `aria-label`, but then *also* read the inner text of the badge, causing redundancy or confusion.
**Action:** Always dynamically include the count in the `aria-label` itself (e.g., `aria-label={Comments (${count})}`) AND apply `aria-hidden="true"` to the inner badge element to prevent screen readers from reading it redundantly.
