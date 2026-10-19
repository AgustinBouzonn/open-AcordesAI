import { parseChord } from './chordTheory';

export interface ChordShape {
  name: string;
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  barre?: { fret: number; fromString: number; toString: number };
}

const x = -1;

function dim7(frets: number[], fingers: number[], roots: string[]): Record<string, ChordShape> {
  return Object.fromEntries(roots.map((r) => [`${r}dim7`, { name: `${r}dim7`, frets, fingers }]));
}

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

  // Menores con sostenido (cejilla): F#m, C#m y G#m aparecen en muchísimas canciones.
  'C#m': { name: 'C#m', frets: [x, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, fromString: 1, toString: 5 } },
  'D#m': { name: 'D#m', frets: [x, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 6, fromString: 1, toString: 5 } },
  'F#m': { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, fromString: 0, toString: 5 } },
  'G#m': { name: 'G#m', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 4, fromString: 0, toString: 5 } },
  'A#m': { name: 'A#m', frets: [x, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, fromString: 1, toString: 5 } },

  'C#7': { name: 'C#7', frets: [x, 4, 6, 4, 6, 4], fingers: [0, 1, 3, 1, 4, 1], barre: { fret: 4, fromString: 1, toString: 5 } },
  'D#7': { name: 'D#7', frets: [x, 6, 8, 6, 8, 6], fingers: [0, 1, 3, 1, 4, 1], barre: { fret: 6, fromString: 1, toString: 5 } },
  'F#7': { name: 'F#7', frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 2, fromString: 0, toString: 5 } },
  'G#7': { name: 'G#7', frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 4, fromString: 0, toString: 5 } },
  'A#7': { name: 'A#7', frets: [x, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barre: { fret: 1, fromString: 1, toString: 5 } },

  Fm7:  { name: 'Fm7',  frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, fromString: 0, toString: 5 } },
  Gm7:  { name: 'Gm7',  frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 3, fromString: 0, toString: 5 } },
  'C#m7': { name: 'C#m7', frets: [x, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 4, fromString: 1, toString: 5 } },
  'D#m7': { name: 'D#m7', frets: [x, 6, 8, 6, 7, 6], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 6, fromString: 1, toString: 5 } },
  'F#m7': { name: 'F#m7', frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 2, fromString: 0, toString: 5 } },
  'G#m7': { name: 'G#m7', frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 4, fromString: 0, toString: 5 } },
  'A#m7': { name: 'A#m7', frets: [x, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 1, fromString: 1, toString: 5 } },

  Bmaj7:  { name: 'Bmaj7',  frets: [x, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 2, fromString: 1, toString: 5 } },
  'A#maj7': { name: 'A#maj7', frets: [x, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 1, fromString: 1, toString: 5 } },
  'C#maj7': { name: 'C#maj7', frets: [x, 4, 6, 5, 6, 4], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 4, fromString: 1, toString: 5 } },
  'F#maj7': { name: 'F#maj7', frets: [x, x, 4, 3, 2, 1], fingers: [0, 0, 4, 3, 2, 1] },

  Csus4:{ name: 'Csus4',frets: [x, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
  Gsus4:{ name: 'Gsus4',frets: [3, x, 0, 0, 1, 3], fingers: [2, 0, 0, 0, 1, 3] },
  Csus2:{ name: 'Csus2',frets: [x, 3, 0, 0, 1, x], fingers: [0, 3, 0, 0, 1, 0] },
  Dsus2:{ name: 'Dsus2',frets: [x, x, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  Esus2:{ name: 'Esus2',frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0] },
  Asus2:{ name: 'Asus2',frets: [x, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },

  // Disminuidos: el acorde dim7 es simétrico, así que tres formas cubren las doce notas.
  ...dim7([x, x, 1, 2, 1, 2], [0, 0, 1, 3, 2, 4], ['C', 'D#', 'F#', 'A']),
  ...dim7([x, x, 2, 3, 2, 3], [0, 0, 1, 3, 2, 4], ['C#', 'E', 'G', 'A#']),
  ...dim7([x, x, 0, 1, 0, 1], [0, 0, 0, 1, 0, 2], ['D', 'F', 'G#', 'B']),

  Caug: { name: 'Caug', frets: [x, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  Daug: { name: 'Daug', frets: [x, x, 0, 3, 3, 2], fingers: [0, 0, 0, 2, 3, 1] },
  Eaug: { name: 'Eaug', frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  Gaug: { name: 'Gaug', frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4] },
  Aaug: { name: 'Aaug', frets: [x, 0, 3, 2, 2, 1], fingers: [0, 0, 4, 2, 3, 1] },

  C6:   { name: 'C6',   frets: [x, 3, 2, 2, 1, 0], fingers: [0, 4, 2, 3, 1, 0] },
  D6:   { name: 'D6',   frets: [x, x, 0, 2, 0, 2], fingers: [0, 0, 0, 1, 0, 2] },
  E6:   { name: 'E6',   frets: [0, 2, 2, 1, 2, 0], fingers: [0, 2, 3, 1, 4, 0] },
  G6:   { name: 'G6',   frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, 0, 0, 0, 0] },
  A6:   { name: 'A6',   frets: [x, 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], barre: { fret: 2, fromString: 2, toString: 5 } },
  Am6:  { name: 'Am6',  frets: [x, 0, 2, 2, 1, 2], fingers: [0, 0, 2, 3, 1, 4] },
  Dm6:  { name: 'Dm6',  frets: [x, x, 0, 2, 0, 1], fingers: [0, 0, 0, 2, 0, 1] },
  Em6:  { name: 'Em6',  frets: [0, 2, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0] },

  Cadd9:{ name: 'Cadd9',frets: [x, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
  Gadd9:{ name: 'Gadd9',frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3] },
  Eadd9:{ name: 'Eadd9',frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4] },
  Aadd9:{ name: 'Aadd9',frets: [x, 0, 2, 4, 2, 0], fingers: [0, 0, 1, 4, 2, 0] },

  C9:   { name: 'C9',   frets: [x, 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 3], barre: { fret: 3, fromString: 3, toString: 5 } },
  E9:   { name: 'E9',   frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
  G9:   { name: 'G9',   frets: [3, x, 0, 2, 0, 1], fingers: [3, 0, 0, 2, 0, 1] },
  A9:   { name: 'A9',   frets: [x, 0, 2, 4, 2, 3], fingers: [0, 0, 1, 4, 2, 3] },

  Bm7b5:  { name: 'Bm7b5',  frets: [x, 2, 3, 2, 3, x], fingers: [0, 1, 3, 2, 4, 0] },
  Em7b5:  { name: 'Em7b5',  frets: [0, 1, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 4, 0] },
  Am7b5:  { name: 'Am7b5',  frets: [x, 0, 1, 0, 1, 3], fingers: [0, 0, 1, 0, 2, 4] },
  Dm7b5:  { name: 'Dm7b5',  frets: [x, x, 0, 1, 1, 1], fingers: [0, 0, 0, 1, 1, 1], barre: { fret: 1, fromString: 3, toString: 5 } },
  'F#m7b5': { name: 'F#m7b5', frets: [2, x, 2, 2, 1, x], fingers: [2, 0, 3, 4, 1, 0] },
};

/**
 * Busca la forma de un acorde tal como viene escrito en un cifrado: ignora el bajo ("C/G" → C),
 * pasa bemoles a sostenidos ("Bbm" → A#m) y entiende las variantes de notación ("C7M", "Bm7(b5)", "D°").
 * "dim" sin el 7 usa la forma de dim7, que es como se toca en la mayoría de los cancioneros.
 */
export function lookupShape(name: string, shapes: Record<string, ChordShape>): ChordShape | null {
  const parsed = parseChord(name);
  if (!parsed) return null;
  const found = shapes[parsed.root + parsed.quality];
  if (found) return found;
  if (parsed.quality === 'dim') return shapes[`${parsed.root}dim7`] ?? null;
  return null;
}

export function lookupChord(name: string): ChordShape | null {
  return lookupShape(name, CHORD_SHAPES);
}
