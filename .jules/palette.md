## 2025-02-17 - Direct Navigation Limitations
**Learning:** The application does not hydrate song data from the URL on fresh load, meaning users cannot share or bookmark direct song links unless the data is already cached. This severely impacts the shareability of content.
**Action:** In the future, `App.tsx` should be refactored to fetch song data based on the URL ID if `currentSong` is null, improving the entry experience.

## 2025-02-17 - Accessibility of Icon-Only Buttons
**Learning:** Key interactive elements in `SongViewer` (Favorites, Comments, Font Size) relied solely on icons, making them inaccessible to screen readers and unclear to some users.
**Action:** Systematically audit all icon-only buttons for `aria-label` and `title` attributes. Added these to `SongViewer` to improve accessibility and provide tooltip hints.
