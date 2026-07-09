## 2024-07-09 - Memoize expensive SVG components
**Learning:** SongViewer's monolithic design causes frequent re-renders due to various state changes (font size, UI toggles). This propagates down to expensive SVG chord diagrams that have static data.
**Action:** Always wrap static/pure SVG components with React.memo(), especially when nested in complex parent views with many independent state variables, to bypass unnecessary VDOM recalculations.
