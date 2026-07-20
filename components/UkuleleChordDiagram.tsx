import React, { memo } from 'react';
import { ChordShape } from '../data/chordShapes';

interface Props {
  shape: ChordShape;
  width?: number;
}

export const UkuleleChordDiagram: React.FC<Props> = memo(({ shape, width = 110 }) => {
  // ⚡ Bolt Performance Optimization: Memoized diagram to prevent re-renders when parent scroll changes
  const numStrings = 4;
  const numFrets = 5;
  const padX = 12;
  const padTop = 32;
  const padBottom = 12;
  const stringSpacing = (width - padX * 2) / (numStrings - 1);
  const fretSpacing = 22;
  const height = padTop + fretSpacing * numFrets + padBottom;

  const minFret = Math.min(...shape.frets.filter((f) => f > 0));
  const maxFret = Math.max(...shape.frets);
  const baseFret = shape.baseFret ?? (maxFret > numFrets ? minFret : 1);
  const offset = baseFret > 1 ? baseFret - 1 : 0;

  const xForString = (s: number) => padX + s * stringSpacing;
  const yForFret = (f: number) => padTop + (f - 0.5) * fretSpacing;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="select-none">
      <text x={width / 2} y={16} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">{shape.name}</text>

      {shape.frets.map((f, i) => {
        const cx = xForString(i);
        if (f === -1) return <text key={`x-${i}`} x={cx} y={padTop - 4} textAnchor="middle" fontSize="12" fill="#9ca3af">×</text>;
        if (f === 0) return <circle key={`o-${i}`} cx={cx} cy={padTop - 8} r={4} fill="none" stroke="#9ca3af" strokeWidth={1.2} />;
        return null;
      })}

      {Array.from({ length: numStrings }).map((_, i) => (
        <line key={`s-${i}`} x1={xForString(i)} y1={padTop} x2={xForString(i)} y2={padTop + fretSpacing * numFrets} stroke="#6b7280" strokeWidth={1} />
      ))}

      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line key={`f-${i}`} x1={padX} y1={padTop + i * fretSpacing} x2={padX + stringSpacing * (numStrings - 1)} y2={padTop + i * fretSpacing} stroke={i === 0 && offset === 0 ? '#fff' : '#6b7280'} strokeWidth={i === 0 && offset === 0 ? 3 : 1} />
      ))}

      {offset > 0 && (
        <text x={padX - 6} y={padTop + fretSpacing * 0.5 + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{baseFret}fr</text>
      )}

      {shape.barre && (() => {
        const fret = shape.barre.fret - offset;
        const x1 = xForString(shape.barre.fromString);
        const x2 = xForString(shape.barre.toString);
        return <rect x={x1 - 6} y={yForFret(fret) - 6} width={x2 - x1 + 12} height={12} rx={6} fill="#4f46e5" opacity={0.85} />;
      })()}

      {shape.frets.map((f, i) => {
        if (f <= 0) return null;
        const visualFret = f - offset;
        if (visualFret < 1 || visualFret > numFrets) return null;
        const cx = xForString(i);
        const cy = yForFret(visualFret);
        const finger = shape.fingers?.[i] ?? 0;
        return (
          <g key={`d-${i}`}>
            <circle cx={cx} cy={cy} r={7} fill="#4f46e5" />
            {finger > 0 && <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">{finger}</text>}
          </g>
        );
      })}
    </svg>
  );
});
