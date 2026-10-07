## 2024-10-07 - Dynamic ARIA labels for badge buttons
**Learning:** When adding `aria-label` to buttons that contain a visible count badge (like the comments button), the `aria-label` completely overrides all inner text for screen readers, meaning the count is lost if not explicitly included in the label.
**Action:** Dynamically concatenate the count into the `aria-label` itself (e.g., `aria-label={count > 0 ? "Comentarios (" + count + ")" : "Comentarios"}`) and add `aria-hidden="true"` to the badge element to prevent double-announcing.
