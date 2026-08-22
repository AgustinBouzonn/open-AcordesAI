import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { lookupChord } from '../data/chordShapes';
import { UKULELE_SHAPES } from '../data/ukuleleShapes';
import { ChordDiagram } from './ChordDiagram';
import { UkuleleChordDiagram } from './UkuleleChordDiagram';
import { PianoChordDiagram } from './PianoChordDiagram';
import { extractUniqueChords } from '../services/chordTransposer';

type Instrument = 'guitar' | 'ukulele' | 'piano';

const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function lookupUkulele(name: string) {
  if (!name) return null;
  const cleaned = name.trim().replace(/\s+/g, '');
  const base = cleaned.split('/')[0];
  let normalized = base;
  for (const [flat, sharp] of Object.entries(FLAT_TO_SHARP)) {
    if (normalized.startsWith(flat)) {
      normalized = sharp + normalized.slice(flat.length);
      break;
    }
  }
  return UKULELE_SHAPES[normalized] || null;
}

interface Props {
  chords: string;
  instrument?: Instrument;
}

export const ChordChart: React.FC<Props> = ({ chords, instrument = 'guitar' }) => {
  const [open, setOpen] = useState(true);
  // ⚡ Bolt Performance Optimization: Replace duplicated regex extraction with faster extractUniqueChords from chordTransposer
  const detected = useMemo(() => extractUniqueChords(chords), [chords]);

  const items = useMemo(() => {
    if (instrument === 'piano') {
      return detected.map((name) => ({ name, kind: 'piano' as const }));
    }
    const lookup = instrument === 'ukulele' ? lookupUkulele : lookupChord;
    return detected
      .map((name) => ({ name, shape: lookup(name) }))
      .filter((c): c is { name: string; shape: NonNullable<ReturnType<typeof lookupChord>> } => c.shape !== null)
      .map((c) => ({ name: c.name, kind: instrument, shape: c.shape }));
  }, [detected, instrument]);

  if (items.length === 0) return null;

  const minWidth = instrument === 'piano' ? '180px' : instrument === 'ukulele' ? '110px' : '120px';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl mb-4 overflow-hidden">
      <button onClick={() => setOpen((s) => !s)} className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-dark-700 transition">
        <span>Acordes en esta canción ({items.length}) · {instrument === 'guitar' ? 'Guitarra' : instrument === 'ukulele' ? 'Ukelele' : 'Piano'}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` }}>
          {items.map((item) => (
            <div key={item.name} className="flex justify-center bg-dark-900 rounded-lg py-2 border border-dark-700 hover:border-brand/40 transition">
              {item.kind === 'guitar' && 'shape' in item && <ChordDiagram shape={item.shape} width={120} />}
              {item.kind === 'ukulele' && 'shape' in item && <UkuleleChordDiagram shape={item.shape} width={110} />}
              {item.kind === 'piano' && <PianoChordDiagram chordName={item.name} width={180} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
