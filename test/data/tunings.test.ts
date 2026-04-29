import { describe, expect, it } from 'vitest';
import { TUNINGS, frequencyToNote, closestStringIndex, centsFromTarget, midiToFreq, rebuildTuningWithA4 } from '../../data/tunings';

describe('tunings', () => {
  it('Standard guitar tuning has 6 strings ordered low to high', () => {
    const std = TUNINGS.find((t) => t.id === 'guitar-std')!;
    expect(std.strings.map((s) => `${s.note}${s.octave}`)).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
    expect(std.strings[0].freq).toBeCloseTo(82.41, 1);
    expect(std.strings[5].freq).toBeCloseTo(329.63, 1);
  });

  it('frequencyToNote round-trips through midiToFreq', () => {
    const result = frequencyToNote(440);
    expect(result.name).toBe('A');
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
  });

  it('frequencyToNote reports cents deviation', () => {
    const slightlyFlat = frequencyToNote(438);
    expect(slightlyFlat.name).toBe('A');
    expect(slightlyFlat.cents).toBeLessThan(0);
    const slightlySharp = frequencyToNote(442);
    expect(slightlySharp.cents).toBeGreaterThan(0);
  });

  it('closestStringIndex picks the nearest target', () => {
    const std = TUNINGS.find((t) => t.id === 'guitar-std')!;
    expect(closestStringIndex(83, std.strings)).toBe(0);   // E2
    expect(closestStringIndex(330, std.strings)).toBe(5);  // E4
    expect(closestStringIndex(110, std.strings)).toBe(1);  // A2
  });

  it('centsFromTarget is 0 at the exact frequency and signed correctly', () => {
    expect(centsFromTarget(440, 440)).toBe(0);
    expect(centsFromTarget(442, 440)).toBeGreaterThan(0);
    expect(centsFromTarget(438, 440)).toBeLessThan(0);
  });

  it('rebuildTuningWithA4 shifts every string proportionally', () => {
    const std = TUNINGS.find((t) => t.id === 'guitar-std')!;
    const at432 = rebuildTuningWithA4(std, 432);
    expect(at432.strings[5].freq).toBeCloseTo(std.strings[5].freq * (432 / 440), 2);
  });

  it('Ukulele high-G is re-entrant (G is higher than C/E)', () => {
    const uke = TUNINGS.find((t) => t.id === 'uke-highg')!;
    expect(uke.strings[0].note).toBe('G');
    expect(uke.strings[0].octave).toBe(4);
    expect(uke.strings[0].freq).toBeGreaterThan(uke.strings[1].freq);
  });
});
