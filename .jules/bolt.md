## 2026-02-17 - Use requestAnimationFrame for smooth auto-scroll
**Learning:** `setInterval` for animations can cause visual stutter and battery drain because it's not synchronized with the screen's refresh rate and continues running when the tab is inactive. `requestAnimationFrame` ensures smooth 60fps animations and pauses execution in background tabs, improving both UX and efficiency.
**Action:** Always prefer `requestAnimationFrame` over `setInterval` for continuous UI updates like auto-scrolling.
