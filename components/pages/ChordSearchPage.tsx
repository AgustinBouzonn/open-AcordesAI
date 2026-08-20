import React, { useState } from 'react';
import { Search, Loader2, ChevronRight, X } from 'lucide-react';
import { Song } from '../../types';
import { api } from '../../services/apiClient';
import { useToast } from '../Toast';
import { Artwork } from '../Artwork';

interface Props {
  onSelectSong: (id: string) => void;
}

const SUGGESTIONS = ['C G Am F', 'C Am F G', 'Em C G D', 'D A Bm G', 'Am F C G'];

export const ChordSearchPage: React.FC<Props> = ({ onSelectSong }) => {
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Song[] | null>(null);

  const addChord = (raw: string) => {
    const c = raw.trim().replace(/^([a-g])/, (m) => m.toUpperCase());
    if (!c || !/^[A-G](#|b)?[a-z0-9#/]{0,6}$/i.test(c)) return;
    if (chips.includes(c) || chips.length >= 8) return;
    setChips([...chips, c]);
    setInput('');
  };

  const removeChip = (idx: number) => setChips(chips.filter((_, i) => i !== idx));

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addChord(input);
    } else if (e.key === 'Backspace' && !input && chips.length) {
      setChips(chips.slice(0, -1));
    }
  };

  const search = async (chordList: string[] = chips) => {
    if (chordList.length === 0) return;
    setLoading(true);
    setResults(null);
    try {
      const r = await api.songs.byChords(chordList);
      setResults(r.results);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error en la búsqueda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const usePreset = (preset: string) => {
    const list = preset.split(/\s+/);
    setChips(list);
    void search(list);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Search className="text-brand" /> Buscar por acordes</h2>
        <p className="text-sm text-gray-400 mt-1">Encontrá canciones que tengan los acordes que sabés tocar.</p>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-2 items-center">
          {chips.map((c, i) => (
            <span key={i} className="bg-brand/20 text-brand border border-brand/40 px-2 py-1 rounded-lg text-sm font-mono flex items-center gap-1">
              {c}
              <button onClick={() => removeChip(i)} className="hover:text-white" aria-label={`Eliminar acorde ${c}`} title={`Eliminar acorde ${c}`}><X size={12} /></button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={chips.length === 0 ? 'C, G, Am, F…' : ''}
            className="flex-1 min-w-[8rem] bg-transparent outline-none text-white text-sm"
          />
          <button
            onClick={() => search()}
            disabled={chips.length === 0 || loading}
            className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Buscar
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Presioná Enter, espacio o coma para agregar un acorde. Hasta 8.</p>
      </div>

      {!results && !loading && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Progresiones populares</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => usePreset(s)} className="bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-300">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" size={32} /></div>}

      {results && results.length === 0 && (
        <div className="text-center text-gray-500 py-10">Ninguna canción matchea esa progresión.</div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-500">{results.length} resultado{results.length === 1 ? '' : 's'}</p>
          {results.map((song) => (
            <div key={song.id} onClick={() => onSelectSong(song.id)} className="bg-dark-800 hover:bg-dark-700 p-3 rounded-xl cursor-pointer border border-dark-700 hover:border-brand/30 transition flex items-center gap-3">
              <Artwork size={48} url={song.artworkUrl} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
              <ChevronRight size={16} className="text-gray-500 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
