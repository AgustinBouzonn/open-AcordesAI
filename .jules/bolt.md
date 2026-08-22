## 2025-02-27 - Remove Duplicate Chord Extraction
**Learning:** Duplicating chord extraction logic with less efficient Regex mapping (`String.prototype.matchAll`) in `ChordChart.tsx` was ~10x slower than using the optimized, dedicated `extractUniqueChords` function in `chordTransposer.ts` that relies on simpler string parsing and targeted regex checks.
**Action:** Always verify if a specialized parsing utility already exists in the `services` directory before implementing ad-hoc extraction logic in UI components, avoiding both duplication and performance penalties.
