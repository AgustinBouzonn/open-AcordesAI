// Datos del diccionario de acordes de la landing. Sale de las mismas formas que usa la app
// (data/chordShapes.ts y data/ukuleleShapes.ts), así que un acorde nuevo ahí aparece solo acá.
import { CHORD_SHAPES, type ChordShape } from '../../data/chordShapes';
import { UKULELE_SHAPES } from '../../data/ukuleleShapes';
import { chordToMidiNotes, midiToNoteName, parseChord } from '../../data/chordTheory';

const NOTE_ES: Record<string, string> = {
  C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
};
const SHARP_TO_FLAT: Record<string, string> = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

export interface Quality {
  suffix: string;
  name: string;
  group: string;
  formula: string;
}

// El orden define el orden de los grupos en el índice.
export const QUALITIES: Quality[] = [
  { suffix: '', name: 'mayor', group: 'Mayores', formula: '1 – 3 – 5' },
  { suffix: 'm', name: 'menor', group: 'Menores', formula: '1 – ♭3 – 5' },
  { suffix: '7', name: 'séptima', group: 'Séptima', formula: '1 – 3 – 5 – ♭7' },
  { suffix: 'm7', name: 'menor séptima', group: 'Menor séptima', formula: '1 – ♭3 – 5 – ♭7' },
  { suffix: 'maj7', name: 'séptima mayor', group: 'Séptima mayor', formula: '1 – 3 – 5 – 7' },
  { suffix: 'sus4', name: 'cuarta suspendida', group: 'Suspendidos', formula: '1 – 4 – 5' },
];

export interface ChordEntry {
  name: string;
  slug: string;
  root: string;
  quality: Quality;
  spanishName: string;
  altName: string | null;
  notes: string[];
  guitar: ChordShape;
  ukulele: ChordShape | null;
}

/** Nombre de una nota en español: "C#" → "Do sostenido". */
export function noteToSpanish(note: string): string {
  const base = NOTE_ES[note[0]];
  if (!base) return note;
  if (note[1] === '#') return `${base} sostenido`;
  if (note[1] === 'b') return `${base} bemol`;
  return base;
}

/** "C#m7" → "c-sostenido-m7". Solo letras, números y guiones para que la URL sea limpia. */
export function chordSlug(name: string): string {
  return name.toLowerCase().replace('#', '-sostenido-').replace(/-+$/, '').replace(/-+/g, '-');
}

export function buildChordEntries(): ChordEntry[] {
  const entries: ChordEntry[] = [];
  for (const [name, guitar] of Object.entries(CHORD_SHAPES)) {
    const parsed = parseChord(name);
    const quality = QUALITIES.find((q) => q.suffix === parsed?.quality);
    if (!parsed || !quality) continue;
    const flat = SHARP_TO_FLAT[parsed.root];
    const midi = chordToMidiNotes(name)?.midi ?? [];
    entries.push({
      name,
      slug: chordSlug(name),
      root: parsed.root,
      quality,
      spanishName: `${noteToSpanish(parsed.root)} ${quality.name}`,
      altName: flat ? `${flat}${quality.suffix}` : null,
      notes: midi.map((m) => midiToNoteName(m).name),
      guitar,
      ukulele: UKULELE_SHAPES[name] ?? null,
    });
  }
  return entries;
}

const FINGERS = ['', 'índice', 'medio', 'anular', 'meñique'];
export const GUITAR_STRINGS = ['6ª (Mi grave)', '5ª (La)', '4ª (Re)', '3ª (Sol)', '2ª (Si)', '1ª (Mi agudo)'];
export const UKULELE_STRINGS = ['4ª (Sol)', '3ª (Do)', '2ª (Mi)', '1ª (La)'];

/** Instrucciones en texto de una forma: sirve para lectores de pantalla y para buscadores. */
export function describeShape(shape: ChordShape, strings: string[]): string[] {
  const lines = shape.frets.map((fret, i) => {
    const string = `Cuerda ${strings[i]}`;
    if (fret < 0) return `${string}: no se toca`;
    if (fret === 0) return `${string}: al aire`;
    const finger = shape.fingers?.[i] ?? 0;
    return `${string}: traste ${fret}${finger ? `, dedo ${FINGERS[finger]}` : ''}`;
  });
  if (shape.barre) {
    lines.unshift(`Cejilla con el índice en el traste ${shape.barre.fret}, de la cuerda ${strings[shape.barre.fromString]} a la ${strings[shape.barre.toString]}`);
  }
  return lines;
}
