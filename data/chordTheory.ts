const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

export interface ChordParse {
  root: string;
  quality: string;
  bass: string | null;
}

// Variantes de escritura → nombre canónico. Cifra Club usa "7M", "m7(b5)", "7(9)" y "°"; otros sitios
// "maj7", "ø", "add9", "+". El orden importa: las formas más largas van primero.
const QUALITY_ALIASES: Array<[RegExp, string]> = [
  [/^(?:maj7|Maj7|M7|7M|Δ7?|7maj)$/, 'maj7'],
  [/^(?:m7\(?b5\)?|m7-5|m7\(-5\)|ø7?|min7b5)$/, 'm7b5'],
  [/^(?:dim7|°7|º7|o7)$/, 'dim7'],
  [/^(?:dim|°|º|o)$/, 'dim'],
  [/^(?:aug|\+|\(#5\)|#5|\+5)$/, 'aug'],
  [/^(?:7\(9\)|9)$/, '9'],
  [/^(?:add9|\(9\)|add2|2)$/, 'add9'],
  [/^(?:m|min|-)$/, 'm'],
  [/^(?:m7|min7|-7)$/, 'm7'],
  [/^(?:m6|min6|-6)$/, 'm6'],
  [/^(?:sus|sus4|4)$/, 'sus4'],
  [/^(?:sus2)$/, 'sus2'],
];

/** "7M" → "maj7", "m7(b5)" → "m7b5", "°" → "dim"… Lo que no reconoce lo devuelve igual. */
export function normalizeQuality(quality: string): string {
  for (const [re, canonical] of QUALITY_ALIASES) {
    if (re.test(quality)) return canonical;
  }
  return quality;
}

export function parseChord(name: string): ChordParse | null {
  if (!name) return null;
  const cleaned = name.trim().replace(/\s+/g, '');
  const match = cleaned.match(/^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/);
  if (!match) return null;
  let root = match[1];
  if (FLAT_TO_SHARP[root]) root = FLAT_TO_SHARP[root];
  let bass = match[3] || null;
  if (bass && FLAT_TO_SHARP[bass]) bass = FLAT_TO_SHARP[bass];
  return { root, quality: normalizeQuality(match[2] || ''), bass };
}

const QUALITY_INTERVALS: Array<[RegExp, number[]]> = [
  [/^m7b5$/, [0, 3, 6, 10]],
  [/^maj7|M7$/, [0, 4, 7, 11]],
  [/^m7|min7$/, [0, 3, 7, 10]],
  [/^7$/, [0, 4, 7, 10]],
  [/^6$/, [0, 4, 7, 9]],
  [/^m6|min6$/, [0, 3, 7, 9]],
  [/^9$/, [0, 4, 7, 10, 14]],
  [/^m9|min9$/, [0, 3, 7, 10, 14]],
  [/^maj9|M9$/, [0, 4, 7, 11, 14]],
  [/^dim7$/, [0, 3, 6, 9]],
  [/^dim$/, [0, 3, 6]],
  [/^aug|\+$/, [0, 4, 8]],
  [/^sus2$/, [0, 2, 7]],
  [/^sus4|sus$/, [0, 5, 7]],
  [/^add9$/, [0, 4, 7, 14]],
  [/^m|min/, [0, 3, 7]],
  [/^$/, [0, 4, 7]],
];

function intervalsForQuality(quality: string): number[] {
  for (const [re, ivs] of QUALITY_INTERVALS) {
    if (re.test(quality)) return ivs;
  }
  return [0, 4, 7];
}

function rootIndex(root: string): number {
  const idx = NOTE_NAMES.indexOf(root as typeof NOTE_NAMES[number]);
  return idx === -1 ? 0 : idx;
}

export function chordToMidiNotes(name: string, baseOctave = 4): { midi: number[]; bassMidi: number | null } | null {
  const parsed = parseChord(name);
  if (!parsed) return null;
  const ri = rootIndex(parsed.root);
  const intervals = intervalsForQuality(parsed.quality);
  const baseMidi = (baseOctave + 1) * 12 + ri;
  const midi = intervals.map((iv) => baseMidi + iv);
  let bassMidi: number | null = null;
  if (parsed.bass) {
    const bi = rootIndex(parsed.bass);
    bassMidi = baseOctave * 12 + bi;
  }
  return { midi, bassMidi };
}

export function midiToNoteName(midi: number): { name: string; octave: number; isBlack: boolean } {
  const noteIdx = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[noteIdx];
  return { name, octave, isBlack: name.includes('#') };
}
