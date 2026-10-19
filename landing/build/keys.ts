// Páginas "Acordes de la tonalidad de X": los acordes de la escala mayor, progresiones típicas y
// con qué capo tocarla usando formas fáciles. Todo sale de la teoría, no hay datos a mano por tonalidad.
import { lookupChord } from '../../data/chordShapes';
import { noteToSpanish } from './chords';

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Orden del círculo de quintas: así aparecen en el índice.
export const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db']);
const EASY_SHAPE_KEYS = ['C', 'G', 'D', 'A', 'E'];

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const DEGREES = [
  { roman: 'I', suffix: '', role: 'Tónica: donde la canción descansa' },
  { roman: 'ii', suffix: 'm', role: 'Prepara la dominante' },
  { roman: 'iii', suffix: 'm', role: 'Color, reemplaza a la tónica' },
  { roman: 'IV', suffix: '', role: 'Subdominante: se aleja de la tónica' },
  { roman: 'V', suffix: '', role: 'Dominante: pide volver a la tónica' },
  { roman: 'vi', suffix: 'm', role: 'Relativa menor' },
  { roman: 'vii°', suffix: 'dim', role: 'Sensible, tensión hacia la tónica' },
];

export interface KeyChord {
  roman: string;
  /** Cómo se escribe en esta tonalidad ("Bb", "E#°"). */
  label: string;
  /** Nombre que entiende el diccionario (sostenidos, dim → dim7). */
  lookup: string;
  role?: string;
}

export interface Progression {
  name: string;
  romans: string;
  chords: KeyChord[];
}

export interface KeyInfo {
  tonic: string;
  slug: string;
  spanish: string;
  chords: KeyChord[];
  dominantSeventh: KeyChord;
  relativeMinor: KeyChord;
  progressions: Progression[];
  capo: Array<{ capo: number; shapes: string }>;
}

const index = (note: string) => {
  const i = SHARPS.indexOf(note);
  return i >= 0 ? i : FLATS.indexOf(note);
};

function spell(tonic: string, step: number, degree: number): string {
  const pc = (index(tonic) + step) % 12;
  // F# mayor: la séptima es E#, no F (la letra no se repite en la escala).
  if (tonic === 'F#' && degree === 6) return 'E#';
  return (FLAT_KEYS.has(tonic) ? FLATS : SHARPS)[pc];
}

function chord(tonic: string, degree: number, suffix: string, roman: string, role?: string): KeyChord {
  const root = spell(tonic, MAJOR_STEPS[degree], degree);
  const lookupRoot = root === 'E#' ? 'F' : root;
  const label = suffix === 'dim' ? `${root}°` : `${root}${suffix}`;
  const shape = lookupChord(`${lookupRoot}${suffix}`);
  return { roman, label, lookup: shape?.name ?? `${lookupRoot}${suffix}`, role };
}

export function keySlug(tonic: string): string {
  return `tonalidad-${noteToSpanish(tonic).toLowerCase().replace(/\s+/g, '-')}-mayor`;
}

export function buildKey(tonic: string): KeyInfo {
  const chords = DEGREES.map((d, i) => chord(tonic, i, d.suffix, d.roman, d.role));
  const dominantSeventh = chord(tonic, 4, '7', 'V7');
  const byRoman = (r: string) => (r === 'V7' ? dominantSeventh : chords.find((c) => c.roman === r)!);
  const seventh = (degree: number, roman: string) => chord(tonic, degree, '7', roman);
  const prog = (name: string, romans: string[]): Progression => ({ name, romans: romans.join(' – '), chords: romans.map(byRoman) });
  const [I7, IV7, V7] = [seventh(0, 'I7'), seventh(3, 'IV7'), seventh(4, 'V7')];

  return {
    tonic,
    slug: keySlug(tonic),
    spanish: `${noteToSpanish(tonic)} mayor`,
    chords,
    dominantSeventh,
    relativeMinor: chords[5],
    progressions: [
      prog('La del pop', ['I', 'V', 'vi', 'IV']),
      prog('Balada de los 50', ['I', 'vi', 'IV', 'V']),
      prog('Empezando en la menor', ['vi', 'IV', 'I', 'V']),
      prog('Folclore y rock básico', ['I', 'IV', 'V7', 'I']),
      prog('Cadencia de jazz', ['ii', 'V7', 'I']),
      { name: 'Blues de 12 compases', romans: 'I7 ×4 – IV7 ×2 – I7 ×2 – V7 – IV7 – I7 – V7', chords: [I7, I7, I7, I7, IV7, IV7, I7, I7, V7, IV7, I7, V7] },
    ],
    capo: EASY_SHAPE_KEYS.map((shapes) => ({ capo: (index(tonic) - index(shapes) + 12) % 12, shapes }))
      .filter((c) => c.capo >= 1 && c.capo <= 7)
      .sort((a, b) => a.capo - b.capo),
  };
}

export function buildKeys(): KeyInfo[] {
  return MAJOR_KEYS.map(buildKey);
}
