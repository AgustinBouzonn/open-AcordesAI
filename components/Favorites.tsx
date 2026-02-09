import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Music, ChevronRight } from 'lucide-react';
import { getFavoriteSongsFull } from '../services/storageService';

interface FavoritesProps {
  loadSong: (id: string, title?: string, artist?: string) => Promise<void>;
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
            className="mt-4 text-brand font-medium hover:underline"
          >
            Buscar canciones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favs.map((song) => (
            <div
              key={song.id}
              onClick={() => loadSong(song.id)}
              className="group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
