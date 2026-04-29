import { describe, expect, it } from 'vitest';
import { parseChord, chordToMidiNotes, midiToNoteName } from '../../data/chordTheory';

describe('chordTheory', () => {
  it('parses simple major chords', () => {
    expect(parseChord('C')).toEqual({ root: 'C', quality: '', bass: null });
    expect(parseChord('G')).toEqual({ root: 'G', quality: '', bass: null });
  });

  it('parses minor and 7th chords', () => {
    expect(parseChord('Am')).toEqual({ root: 'A', quality: 'm', bass: null });
    expect(parseChord('D7')).toEqual({ root: 'D', quality: '7', bass: null });
    expect(parseChord('Cmaj7')).toEqual({ root: 'C', quality: 'maj7', bass: null });
  });

  it('parses slash bass and folds flats to sharps', () => {
    expect(parseChord('C/G')).toEqual({ root: 'C', quality: '', bass: 'G' });
    expect(parseChord('Bb')).toEqual({ root: 'A#', quality: '', bass: null });
    expect(parseChord('D/F#')).toEqual({ root: 'D', quality: '', bass: 'F#' });
  });

  it('returns null for invalid chord names', () => {
    expect(parseChord('')).toBeNull();
    expect(parseChord('xyz')).toBeNull();
  });

  it('produces correct intervals for major triad', () => {
    const c = chordToMidiNotes('C', 4);
    expect(c).not.toBeNull();
    if (!c) return;
    expect(c.midi).toHaveLength(3);
    const diffs = [c.midi[1] - c.midi[0], c.midi[2] - c.midi[0]];
    expect(diffs).toEqual([4, 7]);
  });

  it('produces correct intervals for minor 7th', () => {
    const am7 = chordToMidiNotes('Am7', 4);
    if (!am7) throw new Error('parse failed');
    const diffs = am7.midi.slice(1).map((n) => n - am7.midi[0]);
    expect(diffs).toEqual([3, 7, 10]);
  });

  it('midiToNoteName round-trips with octave info', () => {
    expect(midiToNoteName(60)).toEqual({ name: 'C', octave: 4, isBlack: false });
    expect(midiToNoteName(61)).toEqual({ name: 'C#', octave: 4, isBlack: true });
    expect(midiToNoteName(69)).toEqual({ name: 'A', octave: 4, isBlack: false });
  });
});
