import React from 'react';
import { Heart, LogIn } from 'lucide-react';
import { Song } from '../../types';
import { Artwork } from '../Artwork';

interface Props {
  favorites: Song[];
  user?: { username: string } | null;
  onSelectSong: (id: string) => void;
  onLogin: () => void;
}

export const FavoritesPage: React.FC<Props> = ({ favorites, user, onSelectSong, onLogin }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold flex items-center gap-2"><Heart className="text-brand fill-current" />Mis Favoritos</h2>
    {favorites.length === 0 ? (
      <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
        <Heart size={48} className="mx-auto mb-4 opacity-20" />
        <p>Aún no tienes canciones favoritas.</p>
        {!user && (
          <button onClick={onLogin} className="mt-4 text-brand font-medium hover:underline flex items-center justify-center gap-2">
            <LogIn size={16} /> Inicia sesión
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((song) => (
          <div key={song.id} onClick={() => onSelectSong(song.id)} className="group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4">
              <Artwork url={song.artworkUrl} size={52} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                <p className="text-gray-400 text-sm truncate">{song.artist}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
