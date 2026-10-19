import { describe, expect, it } from 'vitest';
import { lookupChord, CHORD_SHAPES, type ChordShape } from '../../data/chordShapes';
import { UKULELE_SHAPES, lookupUkulele } from '../../data/ukuleleShapes';
import { chordToMidiNotes, midiToNoteName, normalizeQuality } from '../../data/chordTheory';

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
    expect(lookupChord('Ebm')?.name).toBe('D#m');
    expect(lookupChord('Gbm7')?.name).toBe('F#m7');
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

  it('understands Cifra Club and jazz notation', () => {
    expect(lookupChord('C7M')?.name).toBe('Cmaj7');
    expect(lookupChord('Bm7(b5)')?.name).toBe('Bm7b5');
    expect(lookupChord('Bø')?.name).toBe('Bm7b5');
    expect(lookupChord('A7(9)')?.name).toBe('A9');
    expect(lookupChord('C(9)')?.name).toBe('Cadd9');
    expect(lookupChord('E+')?.name).toBe('Eaug');
    expect(lookupChord('Asus')?.name).toBe('Asus4');
    // "dim" sin 7 se toca como dim7 en los cancioneros.
    expect(lookupChord('D°')?.name).toBe('Ddim7');
    expect(lookupChord('Bbdim')?.name).toBe('A#dim7');
    expect(lookupUkulele('F#m')?.name).toBe('F#m');
    expect(lookupUkulele('C7M')?.name).toBe('Cmaj7');
  });

  it('has a shape for every minor and dominant seventh in the 12 keys', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (const r of roots) {
      for (const q of ['', 'm', '7', 'm7', 'dim7']) {
        expect(CHORD_SHAPES[r + q], `${r + q}`).toBeDefined();
      }
    }
  });
});

// Cada forma tiene que sonar el acorde que dice ser: las notas de las cuerdas pisadas tienen que ser
// exactamente las del acorde. Solo se permite omitir la quinta, como en cualquier cancionero.
describe.each([
  ['guitarra', CHORD_SHAPES, [40, 45, 50, 55, 59, 64]],
  ['ukelele', UKULELE_SHAPES, [67, 60, 64, 69]],
] as const)('%s shapes match chord theory', (_label, shapes, openStrings) => {
  const pc = (m: number) => ((m % 12) + 12) % 12;
  const names = (set: number[]) => set.map((p) => midiToNoteName(60 + p).name).join(' ');

  it.each(Object.entries(shapes as Record<string, ChordShape>))('%s', (name, shape) => {
    expect(shape.frets).toHaveLength(openStrings.length);
    expect(shape.name).toBe(name);
    const midi = chordToMidiNotes(name)!.midi;
    const want = new Set(midi.map(pc));
    const fifth = pc(midi[0] + (normalizeQuality(name.replace(/^[A-G]#?/, '')).includes('b5') ? 6 : 7));
    const got = new Set(shape.frets.flatMap((f, i) => (f < 0 ? [] : [pc(openStrings[i] + f)])));
    const extra = [...got].filter((p) => !want.has(p));
    const missing = [...want].filter((p) => !got.has(p) && p !== fifth);
    expect({ extra: names(extra), missing: names(missing) }).toEqual({ extra: '', missing: '' });
    if (shape.barre) {
      const { fret, fromString, toString } = shape.barre;
      for (let s = fromString; s <= toString; s++) {
        if (shape.frets[s] >= 0) expect(shape.frets[s], `${name}: cuerda ${s} bajo la cejilla`).toBeGreaterThanOrEqual(fret);
      }
    }
  });
});
