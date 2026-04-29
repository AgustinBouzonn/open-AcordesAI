import type { ChordShape } from './chordShapes';

const x = -1;

const make = (name: string, frets: number[], fingers: number[], barre?: ChordShape['barre']): ChordShape => ({ name, frets, fingers, barre });

export const UKULELE_SHAPES: Record<string, ChordShape> = {
  C:    make('C',    [0, 0, 0, 3], [0, 0, 0, 3]),
  'C#': make('C#',   [1, 1, 1, 4], [1, 1, 1, 4], { fret: 1, fromString: 0, toString: 2 }),
  D:    make('D',    [2, 2, 2, 0], [1, 2, 3, 0]),
  'D#': make('D#',   [0, 3, 3, 1], [0, 2, 3, 1]),
  E:    make('E',    [4, 4, 4, 2], [3, 4, 4, 1], { fret: 4, fromString: 0, toString: 2 }),
  F:    make('F',    [2, 0, 1, 0], [2, 0, 1, 0]),
  'F#': make('F#',   [3, 1, 2, 1], [3, 1, 2, 1]),
  G:    make('G',    [0, 2, 3, 2], [0, 1, 3, 2]),
  'G#': make('G#',   [5, 3, 4, 3], [4, 1, 3, 2], { fret: 3, fromString: 1, toString: 3 }),
  A:    make('A',    [2, 1, 0, 0], [2, 1, 0, 0]),
  'A#': make('A#',   [3, 2, 1, 1], [3, 2, 1, 1], { fret: 1, fromString: 2, toString: 3 }),
  B:    make('B',    [4, 3, 2, 2], [4, 3, 1, 1], { fret: 2, fromString: 2, toString: 3 }),

  Cm:   make('Cm',   [0, 3, 3, 3], [0, 1, 2, 3]),
  Dm:   make('Dm',   [2, 2, 1, 0], [3, 2, 1, 0]),
  Em:   make('Em',   [0, 4, 3, 2], [0, 4, 2, 1]),
  Fm:   make('Fm',   [1, 0, 1, 3], [1, 0, 2, 4]),
  Gm:   make('Gm',   [0, 2, 3, 1], [0, 2, 4, 1]),
  Am:   make('Am',   [2, 0, 0, 0], [2, 0, 0, 0]),
  Bm:   make('Bm',   [4, 2, 2, 2], [3, 1, 1, 1], { fret: 2, fromString: 1, toString: 3 }),

  C7:   make('C7',   [0, 0, 0, 1], [0, 0, 0, 1]),
  D7:   make('D7',   [2, 2, 2, 3], [1, 1, 1, 3], { fret: 2, fromString: 0, toString: 2 }),
  E7:   make('E7',   [1, 2, 0, 2], [1, 3, 0, 2]),
  F7:   make('F7',   [2, 3, 1, 3], [2, 3, 1, 4]),
  G7:   make('G7',   [0, 2, 1, 2], [0, 2, 1, 3]),
  A7:   make('A7',   [0, 1, 0, 0], [0, 1, 0, 0]),
  B7:   make('B7',   [2, 3, 2, 2], [1, 4, 2, 3]),

  Am7:  make('Am7',  [0, 0, 0, 0], [0, 0, 0, 0]),
  Dm7:  make('Dm7',  [2, 2, 1, 3], [2, 3, 1, 4]),
  Em7:  make('Em7',  [0, 2, 0, 2], [0, 1, 0, 2]),
  Cmaj7:make('Cmaj7',[0, 0, 0, 2], [0, 0, 0, 2]),
  Dmaj7:make('Dmaj7',[2, 2, 2, 4], [1, 1, 1, 4], { fret: 2, fromString: 0, toString: 2 }),
  Fmaj7:make('Fmaj7',[2, 4, 1, 0], [2, 4, 1, 0]),
  Gmaj7:make('Gmaj7',[0, 2, 2, 2], [0, 1, 2, 3]),
};
