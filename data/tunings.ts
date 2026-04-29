export type Instrument = 'guitar' | 'ukulele';

export interface TuningString {
  note: string;
  octave: number;
  freq: number;
}

export interface Tuning {
  id: string;
  name: string;
  instrument: Instrument;
  strings: TuningString[];
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function noteToMidi(note: string, a4Hz = 440): number {
  const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  let [, name, octStr] = match;
  if (FLAT_TO_SHARP[name]) name = FLAT_TO_SHARP[name];
  const idx = NOTE_NAMES.indexOf(name as typeof NOTE_NAMES[number]);
  if (idx === -1) throw new Error(`Invalid note name: ${name}`);
  const oct = parseInt(octStr, 10);
  return (oct + 1) * 12 + idx;
}

export function midiToFreq(midi: number, a4Hz = 440): number {
  return a4Hz * Math.pow(2, (midi - 69) / 12);
}

function makeStrings(notes: string[], a4Hz = 440): TuningString[] {
  return notes.map((n) => {
    const midi = noteToMidi(n, a4Hz);
    const noteIdx = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return { note: NOTE_NAMES[noteIdx], octave, freq: midiToFreq(midi, a4Hz) };
  });
}

export const TUNINGS: Tuning[] = [
  { id: 'guitar-std', name: 'Standard (E A D G B E)', instrument: 'guitar', strings: makeStrings(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']) },
  { id: 'guitar-dropd', name: 'Drop D', instrument: 'guitar', strings: makeStrings(['D2', 'A2', 'D3', 'G3', 'B3', 'E4']) },
  { id: 'guitar-eb', name: 'Half step down (Eb)', instrument: 'guitar', strings: makeStrings(['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4']) },
  { id: 'guitar-d', name: 'Whole step down (D)', instrument: 'guitar', strings: makeStrings(['D2', 'G2', 'C3', 'F3', 'A3', 'D4']) },
  { id: 'guitar-dropc', name: 'Drop C', instrument: 'guitar', strings: makeStrings(['C2', 'G2', 'C3', 'F3', 'A3', 'D4']) },
  { id: 'guitar-dadgad', name: 'DADGAD', instrument: 'guitar', strings: makeStrings(['D2', 'A2', 'D3', 'G3', 'A3', 'D4']) },
  { id: 'guitar-opend', name: 'Open D', instrument: 'guitar', strings: makeStrings(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']) },
  { id: 'guitar-openg', name: 'Open G', instrument: 'guitar', strings: makeStrings(['D2', 'G2', 'D3', 'G3', 'B3', 'D4']) },
  { id: 'guitar-opene', name: 'Open E', instrument: 'guitar', strings: makeStrings(['E2', 'B2', 'E3', 'G#3', 'B3', 'E4']) },
  { id: 'guitar-openc', name: 'Open C', instrument: 'guitar', strings: makeStrings(['C2', 'G2', 'C3', 'G3', 'C4', 'E4']) },
  { id: 'uke-highg', name: 'Soprano/Concert/Tenor (high-G)', instrument: 'ukulele', strings: makeStrings(['G4', 'C4', 'E4', 'A4']) },
  { id: 'uke-lowg', name: 'Tenor (low-G)', instrument: 'ukulele', strings: makeStrings(['G3', 'C4', 'E4', 'A4']) },
  { id: 'uke-bari', name: 'Baritone (D G B E)', instrument: 'ukulele', strings: makeStrings(['D3', 'G3', 'B3', 'E4']) },
];

export function frequencyToNote(freq: number, a4Hz = 440) {
  const midiFloat = 12 * Math.log2(freq / a4Hz) + 69;
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  const noteIdx = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { name: NOTE_NAMES[noteIdx], octave, cents, midi };
}

export function closestStringIndex(freq: number, strings: TuningString[]): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < strings.length; i++) {
    const semis = Math.abs(12 * Math.log2(freq / strings[i].freq));
    if (semis < bestDist) {
      bestDist = semis;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function centsFromTarget(freq: number, targetFreq: number): number {
  return Math.round(1200 * Math.log2(freq / targetFreq));
}

export function rebuildTuningWithA4(tuning: Tuning, a4Hz: number): Tuning {
  const notes = tuning.strings.map((s) => `${s.note}${s.octave}`);
  return { ...tuning, strings: makeStrings(notes, a4Hz) };
}
