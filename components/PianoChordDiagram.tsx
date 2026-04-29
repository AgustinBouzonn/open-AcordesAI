import React from 'react';
import { chordToMidiNotes, midiToNoteName } from '../data/chordTheory';

interface Props {
  chordName: string;
  width?: number;
}

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NUM_OCTAVES = 2;

export const PianoChordDiagram: React.FC<Props> = ({ chordName, width = 200 }) => {
  const data = chordToMidiNotes(chordName, 4);
  const totalWhite = WHITE_NOTES.length * NUM_OCTAVES;
  const whiteWidth = (width - 4) / totalWhite;
  const whiteHeight = whiteWidth * 3.6;
  const blackWidth = whiteWidth * 0.62;
  const blackHeight = whiteHeight * 0.62;
  const padTop = 26;
  const height = padTop + whiteHeight + 6;

  const startMidi = (4 + 1) * 12;
  const highlighted = new Set<number>(data?.midi ?? []);

  let xCursor = 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="select-none">
      <text x={width / 2} y={16} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">{chordName}</text>

      {Array.from({ length: NUM_OCTAVES }).flatMap((_, oct) =>
        WHITE_NOTES.map((note) => {
          const x = xCursor;
          xCursor += whiteWidth;
          const noteName = note;
          const semitone = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(noteName);
          const midi = startMidi + oct * 12 + semitone;
          const isHi = highlighted.has(midi);
          return (
            <g key={`w-${oct}-${note}`}>
              <rect x={x} y={padTop} width={whiteWidth - 1} height={whiteHeight} rx={2} fill={isHi ? '#4f46e5' : '#f9fafb'} stroke="#6b7280" />
              {isHi && (
                <text x={x + whiteWidth / 2} y={padTop + whiteHeight - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">{noteName}</text>
              )}
            </g>
          );
        })
      )}

      {Array.from({ length: NUM_OCTAVES }).flatMap((_, oct) => {
        const baseX = 2 + oct * 7 * whiteWidth;
        const blackPositions = [
          { offset: 1, sharp: 'C#' },
          { offset: 2, sharp: 'D#' },
          { offset: 4, sharp: 'F#' },
          { offset: 5, sharp: 'G#' },
          { offset: 6, sharp: 'A#' },
        ];
        return blackPositions.map(({ offset, sharp }) => {
          const semitone = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(sharp);
          const midi = startMidi + oct * 12 + semitone;
          const isHi = highlighted.has(midi);
          const x = baseX + offset * whiteWidth - blackWidth / 2;
          return (
            <rect key={`b-${oct}-${sharp}`} x={x} y={padTop} width={blackWidth} height={blackHeight} rx={1.5} fill={isHi ? '#4f46e5' : '#1f2937'} stroke="#0f172a" strokeWidth={0.6} />
          );
        });
      })}

      {data && data.midi.length > 0 && (
        <text x={width / 2} y={height - 1} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {data.midi.map((m) => `${midiToNoteName(m).name}${midiToNoteName(m).octave}`).join(' · ')}
        </text>
      )}
    </svg>
  );
};
