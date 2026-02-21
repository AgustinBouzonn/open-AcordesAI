import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Music, TrendingUp, ChevronRight, Clock, Heart } from 'lucide-react';
import { Song, SongSearchResult, Instrument } from '../types';
import { getFavoriteSongsFull, getHistorySongsFull } from '../services/storageService';
import { SongViewer } from './SongViewer';

const TRENDING_SEARCHES = [
  "Lamento Boliviano - Enanitos Verdes",
  "De Música Ligera - Soda Stereo",
  "La Flaca - Jarabe de Palo",
  "Wonderwall - Oasis",
  "Creep - Radiohead"
];

// --- Home Component ---

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent, override?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand to-yellow-500">
          Toca lo que quieras.
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          La base de datos de cifrados más inteligente. Busca cualquier canción y obtén los acordes al instante con IA.
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Canción o artista..."
            className="w-full bg-dark-800 border border-dark-600 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition shadow-lg"
          />
          <SearchIcon className="absolute left-4 top-3.5 text-gray-500" size={20} />
          <button type="submit" className="hidden">Buscar</button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs">
          <TrendingUp size={16} />
          <span>Tendencias Hoy</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRENDING_SEARCHES.map((term, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch({ preventDefault: () => {} } as any, term)}
              className="w-full group bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl p-4 cursor-pointer transition flex justify-between items-center text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              aria-label={`Buscar ${term}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-dark-900 p-2 rounded-lg text-brand group-hover:scale-110 transition">
                  <Music size={20} />
                </div>
                <span className="font-medium text-sm text-gray-200">{term}</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Search Component ---

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent, override?: string) => void;
  isSearching: boolean;
  searchResults: SongSearchResult[];
  loadSong: (id: string, title?: string, artist?: string) => Promise<void>;
}

export const Search: React.FC<SearchProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  searchResults,
  loadSong
}) => {
  return (
    <div className="space-y-6">
       <div className="sticky top-0 bg-dark-900 z-10 py-2">
         <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand"
              autoFocus
            />
            <SearchIcon className="absolute left-3 top-3.5 text-gray-500" size={20} />
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <Loader2 className="animate-spin text-brand" size={20} />
              </div>
            )}
          </form>
       </div>

       {searchResults.length > 0 ? (
         <div className="space-y-2">
           {searchResults.map((result) => (
             <button
                key={result.id}
                type="button"
                onClick={() => loadSong(result.id, result.title, result.artist)}
                className="w-full bg-dark-800 hover:bg-dark-700 p-4 rounded-xl cursor-pointer border border-transparent hover:border-brand/30 transition flex justify-between items-center text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
             >
               <div>
                 <h3 className="font-bold text-white">{result.title}</h3>
                 <p className="text-sm text-brand">{result.artist}</p>
               </div>
               <div className="bg-dark-900 p-2 rounded-full">
                 <ChevronRight size={16} className="text-gray-500" />
               </div>
             </button>
           ))}
         </div>
       ) : (
         !isSearching && (
           <div className="text-center text-gray-500 mt-20">
             <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
             <p>Busca tu canción favorita para ver los acordes.</p>
           </div>
         )
       )}
    </div>
  );
};

// --- Favorites Component ---

interface FavoritesProps {
  loadSong: (id: string) => Promise<void>;
}

export const Favorites: React.FC<FavoritesProps> = ({ loadSong }) => {
  const navigate = useNavigate();
  // Refresh favorites list when entering this view
  const favs = getFavoriteSongsFull();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Heart className="text-brand fill-current" />
        Mis Favoritos
      </h2>
      {favs.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
          <Heart size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aún no tienes canciones favoritas.</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 text-brand font-medium hover:underline focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded"
          >
            Buscar canciones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favs.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => loadSong(song.id)}
              className="w-full group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/5 to-brand/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4 overflow-hidden">
                     <div className="bg-dark-900/80 p-3 rounded-full text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300 shrink-0 border border-dark-700 group-hover:border-brand">
                        <Music size={24} />
                     </div>

                     <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate group-hover:text-brand transition-colors">{song.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3 pl-3 border-l border-dark-700/50">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Tono</span>
                        <span className="font-mono font-bold text-brand bg-dark-900 px-2 py-0.5 rounded border border-dark-700 shadow-sm min-w-[2rem] text-center">{song.key}</span>
                     </div>
                     <ChevronRight className="text-dark-600 group-hover:text-white transition-transform group-hover:translate-x-1" size={20} />
                  </div>
               </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- History Component ---

interface HistoryProps {
  loadSong: (id: string) => Promise<void>;
}

export const History: React.FC<HistoryProps> = ({ loadSong }) => {
  const history = getHistorySongsFull();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Clock className="text-brand" />
        Historial Reciente
      </h2>
      {history.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <Clock size={48} className="mx-auto mb-4 opacity-20" />
          <p>Las últimas canciones que veas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => loadSong(song.id)}
              className="w-full bg-dark-800 hover:bg-dark-700 p-4 rounded-xl cursor-pointer border border-dark-700 hover:border-brand/30 transition flex justify-between items-center text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <div>
                <h3 className="font-bold text-white">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
              <div className="text-xs text-brand font-mono bg-brand/10 px-2 py-1 rounded">
                 {song.key}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- SongDetail Component ---

interface SongDetailProps {
  isLoadingSong: boolean;
  currentSong: Song | null;
  handleInstrumentChange: (instrument: Instrument) => Promise<void>;
  loadingInstrument: boolean;
}

export const SongDetail: React.FC<SongDetailProps> = ({
  isLoadingSong,
  currentSong,
  handleInstrumentChange,
  loadingInstrument
}) => {
  if (isLoadingSong) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brand">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-white font-medium animate-pulse">La IA está extrayendo los acordes...</p>
      </div>
    );
  }
  if (!currentSong) return <div>Error loading song.</div>;
  return (
      <SongViewer
          song={currentSong}
          onInstrumentChange={handleInstrumentChange}
          isLoadingInstrument={loadingInstrument}
      />
  );
};
