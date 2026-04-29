export interface ChordShape {
  name: string;
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  barre?: { fret: number; fromString: number; toString: number };
}

const x = -1;

export const CHORD_SHAPES: Record<string, ChordShape> = {
  C:    { name: 'C',    frets: [x, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'C#': { name: 'C#',   frets: [x, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], barre: { fret: 1, fromString: 1, toString: 5 } },
  D:    { name: 'D',    frets: [x, x, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'D#': { name: 'D#',   frets: [x, x, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
  E:    { name: 'E',    frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  F:    { name: 'F',    frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, fromString: 0, toString: 5 } },
  'F#': { name: 'F#',   frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 2, fromString: 0, toString: 5 } },
  G:    { name: 'G',    frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'G#': { name: 'G#',   frets: [4, 3, 1, 1, 1, 4], fingers: [3, 2, 1, 1, 1, 4], barre: { fret: 1, fromString: 2, toString: 4 } },
  A:    { name: 'A',    frets: [x, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'A#': { name: 'A#',   frets: [x, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, fromString: 1, toString: 5 } },
  B:    { name: 'B',    frets: [x, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, fromString: 1, toString: 5 } },

  Cm:   { name: 'Cm',   frets: [x, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, fromString: 1, toString: 5 } },
  Dm:   { name: 'Dm',   frets: [x, x, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  Em:   { name: 'Em',   frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  Fm:   { name: 'Fm',   frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, fromString: 0, toString: 5 } },
  Gm:   { name: 'Gm',   frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, fromString: 0, toString: 5 } },
  Am:   { name: 'Am',   frets: [x, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  Bm:   { name: 'Bm',   frets: [x, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, fromString: 1, toString: 5 } },

  C7:   { name: 'C7',   frets: [x, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  D7:   { name: 'D7',   frets: [x, x, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  E7:   { name: 'E7',   frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  F7:   { name: 'F7',   frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, fromString: 0, toString: 5 } },
  G7:   { name: 'G7',   frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  A7:   { name: 'A7',   frets: [x, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  B7:   { name: 'B7',   frets: [x, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },

  Cm7:  { name: 'Cm7',  frets: [x, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 3, fromString: 1, toString: 5 } },
  Dm7:  { name: 'Dm7',  frets: [x, x, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  Em7:  { name: 'Em7',  frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
  Am7:  { name: 'Am7',  frets: [x, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  Bm7:  { name: 'Bm7',  frets: [x, 2, 0, 2, 0, 2], fingers: [0, 2, 0, 3, 0, 4] },

  Cmaj7:{ name: 'Cmaj7',frets: [x, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  Dmaj7:{ name: 'Dmaj7',frets: [x, x, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  Emaj7:{ name: 'Emaj7',frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  Fmaj7:{ name: 'Fmaj7',frets: [x, x, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  Gmaj7:{ name: 'Gmaj7',frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
  Amaj7:{ name: 'Amaj7',frets: [x, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },

  Dsus4:{ name: 'Dsus4',frets: [x, x, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  Asus4:{ name: 'Asus4',frets: [x, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  Esus4:{ name: 'Esus4',frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
};

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
};

export function lookupChord(name: string): ChordShape | null {
  if (!name) return null;
  const cleaned = name.trim().replace(/\s+/g, '');
  // Strip slash bass: C/G → C
  const base = cleaned.split('/')[0];
  // Normalize flats to sharps
  let normalized = base;
  for (const [flat, sharp] of Object.entries(FLAT_TO_SHARP)) {
    if (normalized.startsWith(flat)) {
      normalized = sharp + normalized.slice(flat.length);
      break;
    }
  }
  return CHORD_SHAPES[normalized] || null;
}
