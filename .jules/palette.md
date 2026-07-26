## 2025-02-12 - SongViewer Accessibility Enhancements
**Learning:** Icon-only buttons without `aria-label`s are opaque to screen readers. Disabled buttons should explain *why* they are disabled to avoid user frustration, particularly around authenticated features.
**Action:** When creating icon-only buttons, always add `aria-label`s and `aria-hidden="true"` to the inner icons. When disabling a button based on a user's session state, add a dynamic `title` (or tooltip) that explains they must be logged in to interact with it.
