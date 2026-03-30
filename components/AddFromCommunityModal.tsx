import React, { useState } from 'react';
import { X, Search, Loader2, Music } from 'lucide-react';
import { api } from '../services/apiClient';
import { SearchResult } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (song: { title: string; artist: string }) => void;
}

export function AddFromCommunityModal({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const search = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.request<{ results?: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`);
      setResults(data.results?.slice(0, 10) || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (song: SearchResult) => {
    onSelect({ title: song.title, artist: song.artist });
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeStyle}><X size={20} /></button>
        
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Agregar de iTunes
        </h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            placeholder="Buscar canción..."
            autoFocus
            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
          />
          {loading && <Loader2 className="absolute right-3 top-3 animate-spin text-brand" size={18} />}
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {results.map((song, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(song)}
              className="flex items-center gap-3 p-3 bg-dark-800 hover:bg-dark-700 rounded-lg cursor-pointer transition"
            >
              {song.artworkUrl ? (
                <img src={song.artworkUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
                  <Music className="text-brand" size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{song.title}</p>
                <p className="text-sm text-brand truncate">{song.artist}</p>
              </div>
            </div>
          ))}
          {!loading && query && results.length === 0 && (
            <p className="text-center text-gray-500 py-4">No se encontraron resultados</p>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#1e1e1e', padding: '1.5rem', borderRadius: '0.75rem', width: '100%', maxWidth: '450px', position: 'relative',
};

const closeStyle: React.CSSProperties = {
  position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #374151', background: '#0f0f0f', color: '#fff', fontSize: '0.875rem',
};
