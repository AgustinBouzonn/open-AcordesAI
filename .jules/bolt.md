# Bolt's Journal: Performance Learnings

## 2026-02-07 - Smooth Auto-scrolling with requestAnimationFrame
**Optimization:** Replaced `setInterval` with `requestAnimationFrame` for the auto-scroll feature in `SongViewer.tsx`.
**Rationale:** `setInterval` is not synchronized with the browser's refresh rate, leading to "janky" or stuttering movement, especially on high-refresh-rate monitors. `requestAnimationFrame` ensures that the scroll position is updated exactly before the next paint, resulting in fluid motion.
**Implementation Detail:** Used a `scrollAccumulatorRef` to handle fractional pixel increments. Since `window.scrollBy` typically works with integers, the accumulator ensures that sub-pixel movements are tracked and applied once they sum to at least 1 pixel, maintaining consistent speed across different frame rates.
**Learning:** For any continuous animation or scrolling in React, always prefer `requestAnimationFrame` over `setInterval` or `setTimeout` to ensure visual smoothness and better CPU/battery efficiency.
