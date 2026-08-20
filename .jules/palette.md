## 2025-02-18 - Tooltips and ARIA labels on Icon-only buttons
**Learning:** Found a recurring pattern in the app where secondary actions (like saving/canceling inline edits, or rearranging list items) used icon-only buttons without accessible names. This made these critical interactions completely invisible to screen readers and lacked hover context for sighted users.
**Action:** When adding small utility buttons with icons (especially lucide-react icons), always include `aria-label` and `title` attributes with descriptive verbs (e.g. "Eliminar canción", "Guardar URL").
