import { describe, expect, it } from 'vitest';
import { lookupChord, CHORD_SHAPES } from '../../data/chordShapes';

describe('lookupChord', () => {
  it('finds common shapes by exact name', () => {
    expect(lookupChord('C')?.name).toBe('C');
    expect(lookupChord('Am')?.name).toBe('Am');
    expect(lookupChord('F')?.name).toBe('F');
  });

  it('strips slash bass to the root chord', () => {
    expect(lookupChord('C/G')?.name).toBe('C');
    expect(lookupChord('D/F#')?.name).toBe('D');
  });

  it('maps flats to enharmonic sharps', () => {
    expect(lookupChord('Db')?.name).toBe('C#');
    expect(lookupChord('Bb')?.name).toBe('A#');
    expect(lookupChord('Ebm')?.name).toBeUndefined();
  });

  it('returns null for unknown chords without throwing', () => {
    expect(lookupChord('Xmaj13')).toBeNull();
    expect(lookupChord('')).toBeNull();
  });

  it('barre shapes carry barre metadata', () => {
    const fSharp = CHORD_SHAPES['F#'];
    expect(fSharp.barre).toEqual({ fret: 2, fromString: 0, toString: 5 });
  });

  it('every shape has 6 string entries', () => {
    for (const [name, shape] of Object.entries(CHORD_SHAPES)) {
      expect(shape.frets, `${name} should have 6 frets`).toHaveLength(6);
      if (shape.fingers) expect(shape.fingers, `${name} fingers should also have 6 entries`).toHaveLength(6);
    }
  });
});
