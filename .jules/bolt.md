## 2024-05-24 - [Animation Performance]
**Learning:** `setInterval` for animations (like the auto-scroll feature) causes frame drops, doesn't respect screen refresh rates, and continues running in background tabs, wasting CPU/battery. It scales poorly across devices with different screen refresh rates.
**Action:** Replace `setInterval` with `requestAnimationFrame` using a time-delta calculation (`delta = time - lastTime`) and an accumulator. Defining the `animate` function inside `useEffect` ensures it captures the current state closure without resetting the animation loop on every render.
