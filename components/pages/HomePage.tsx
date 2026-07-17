import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Music, ChevronRight, Star, Guitar, Sparkles } from 'lucide-react';
import { Song } from '../../types';
import { Artwork } from '../Artwork';
import { api } from '../../services/apiClient';

const TRENDING_SEARCHES = [
  'Lamento Boliviano - Enanitos Verdes',
  'De Música Ligera - Soda Stereo',
  'La Flaca - Jarabe de Palo',
  'Wonderwall - Oasis',
  'Creep - Radiohead',
];

interface Props {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSearch: (e: React.FormEvent) => void;
  performSearch: (q: string) => void;
  popularSongs: Song[];
  onSelectSong: (id: string) => void;
  hasUser: boolean;
}

export const HomePage: React.FC<Props> = ({ searchQuery, onSearchQueryChange, onSearch, performSearch, popularSongs, onSelectSong, hasUser }) => {
  const [recs, setRecs] = useState<{ source: 'collaborative' | 'popular'; results: Song[] } | null>(null);

  const trendingCards = React.useMemo(() => (
    TRENDING_SEARCHES.map((term, idx) => (
      <div key={idx} onClick={() => performSearch(term)} className="group bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl p-4 cursor-pointer transition flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-dark-900 p-2 rounded-lg text-brand group-hover:scale-110 transition"><Music size={20} /></div>
          <span className="font-medium text-sm text-gray-200">{term}</span>
        </div>
        <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition" />
      </div>
    ))
  ), [performSearch]);

  useEffect(() => {
    if (!hasUser) { setRecs(null); return; }
    api.recommendations.get(8).then(setRecs).catch(() => undefined);
  }, [hasUser]);

  return (
  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <div className="text-center py-12 space-y-4">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand to-yellow-500">
        Toca lo que quieras.
      </h1>
      <p className="text-gray-400 max-w-lg mx-auto">
        Busca cualquier canción y obtén los acordes al instante con IA.
      </p>
      <form onSubmit={onSearch} className="max-w-md mx-auto relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Canción o artista..."
          className="w-full bg-dark-800 border border-dark-600 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition shadow-lg"
        />
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <button type="submit" className="hidden">Buscar</button>
      </form>
      <Link to="/chord-search" className="inline-flex items-center gap-2 text-brand text-sm hover:underline">
        <Guitar size={14} /> ¿Sabés algunos acordes? Buscá canciones por progresión
      </Link>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs">
        <TrendingUp size={16} />
        <span>Tendencias</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingCards}
      </div>
    </div>

    {recs && recs.results.length > 0 && (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs">
          <Sparkles size={16} />
          <span>{recs.source === 'collaborative' ? 'Recomendado para vos' : 'Te puede gustar'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.results.slice(0, 6).map((song) => (
            <div key={song.id} onClick={() => onSelectSong(song.id)} className="group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-4">
                <Artwork size={52} url={song.artworkUrl} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
                {(song.hasChords || 0) > 0 && (
                  <span className="bg-brand/20 text-brand text-xs px-2 py-1 rounded">Con cifrado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {popularSongs.length > 0 && (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs">
          <Star size={16} />
          <span>Más Populares</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularSongs.slice(0, 6).map((song) => (
            <div key={song.id} onClick={() => onSelectSong(song.id)} className="group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-4">
                <Artwork size={52} url={song.artworkUrl} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {song.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs">{song.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                {(song.hasChords || 0) > 0 && (
                  <span className="bg-brand/20 text-brand text-xs px-2 py-1 rounded">Con cifrado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};
