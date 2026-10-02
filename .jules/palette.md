## 2024-05-24 - Dynamic ARIA labels for badged icon buttons
**Learning:** When adding `aria-label` to an icon button that contains a visible count badge (e.g. comment count), the `aria-label` completely overrides the inner text for screen readers. The count must be dynamically included in the `aria-label` itself to prevent screen readers from missing the badge information.
**Action:** Always interpolate dynamic badge counts into the parent button's `aria-label` and add `aria-hidden="true"` to the inner badge element.
