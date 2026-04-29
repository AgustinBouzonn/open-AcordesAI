const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

export interface ChordParse {
  root: string;
  quality: string;
  bass: string | null;
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
  return { root, quality: match[2] || '', bass };
}

const QUALITY_INTERVALS: Array<[RegExp, number[]]> = [
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
