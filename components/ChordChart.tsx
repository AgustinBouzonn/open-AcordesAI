import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { lookupChord } from '../data/chordShapes';
import { ChordDiagram } from './ChordDiagram';

const CHORD_TOKEN_RE = /\b([A-G](?:#|b)?(?:m(?!aj)|maj|min|dim|aug|sus)?\d*(?:[#b](?:5|9|11|13))*(?:\/[A-G](?:#|b)?)?)\b/g;

function extractChords(text: string): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    const tokens = trimmed.split(/\s+/);
    if (tokens.length === 0) continue;
    const looksLikeChordLine = tokens.every((t) => /^[\[(]?[A-G](?:#|b)?[^\s]*[\])]?$/.test(t));
    if (!looksLikeChordLine) continue;
    for (const m of trimmed.matchAll(CHORD_TOKEN_RE)) {
      const name = m[1];
      const base = name.split('/')[0];
      if (!seen.has(base)) {
        seen.add(base);
        result.push(base);
      }
    }
  }
  return result;
}

interface Props {
  chords: string;
}

export const ChordChart: React.FC<Props> = ({ chords }) => {
  const [open, setOpen] = useState(true);
  const detected = useMemo(() => extractChords(chords), [chords]);
  const shapes = useMemo(
    () => detected.map((name) => ({ name, shape: lookupChord(name) })).filter((c) => c.shape !== null) as { name: string; shape: NonNullable<ReturnType<typeof lookupChord>> }[],
    [detected]
  );

  if (shapes.length === 0) return null;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl mb-4 overflow-hidden">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-dark-700 transition"
      >
        <span>Acordes en esta canción ({shapes.length})</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {shapes.map(({ name, shape }) => (
            <div key={name} className="flex justify-center bg-dark-900 rounded-lg py-2 border border-dark-700 hover:border-brand/40 transition">
              <ChordDiagram shape={shape} width={120} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
