## 2025-02-28 - Badge accessibility in Icon-only buttons
**Learning:** When adding `aria-label` to icon-only buttons containing absolute-positioned dynamic badges (like the comments counter), the outer label completely overrides the badge text for screen readers.
**Action:** Always interpolate dynamic badge counts directly into the parent button's `aria-label` string and apply `aria-hidden="true"` to the badge element itself to prevent redundant or lost readouts.
