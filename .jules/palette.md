## 2026-04-20 - Adding aria-labels to components with conditional children
**Learning:** When adding aria-labels to elements that have conditional children providing context (e.g. comments count badge inside comments button), ensure the aria-label string includes this context if it overrides the inner text, and add aria-hidden="true" to the child so it's not announced redundantly.
**Action:** Always check if a button's content includes dynamic contextual data like counts before overriding its accessible name with a static aria-label.
