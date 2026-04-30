import React from 'react';
import { Users, Plus, Star } from 'lucide-react';
import { Song } from '../../types';
import { Artwork } from '../Artwork';
import { SongCardGridSkeleton } from '../SongCardSkeleton';

interface Props {
  songs: Song[];
  loading: boolean;
  page: number;
  onPageChange: (next: number) => void;
  onSelectSong: (id: string) => void;
  onNewClick: () => void;
  onSearchClick: () => void;
}

export const CommunityPage: React.FC<Props> = ({ songs, loading, page, onPageChange, onSelectSong, onNewClick, onSearchClick }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-brand" />Comunidad</h2>
      <button onClick={onNewClick} className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
        <Plus size={18} /> Crear canción
      </button>
    </div>
    {loading ? (
      <SongCardGridSkeleton count={6} />
    ) : songs.length === 0 ? (
      <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
        <Users size={48} className="mx-auto mb-4 opacity-20" />
        <p>No hay canciones en la comunidad todavía.</p>
        <button onClick={onSearchClick} className="mt-4 text-brand font-medium hover:underline">Sé el primero en agregar una</button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.map((song) => (
          <div key={song.id} onClick={() => onSelectSong(song.id)} className="bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
            <div className="flex items-center gap-4">
              <Artwork size={52} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                <div className="flex items-center gap-3 mt-1">
                  {song.author && <span className="text-xs text-gray-500">por {song.author}</span>}
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
    )}
    {songs.length >= 20 && (
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 bg-dark-700 rounded-lg disabled:opacity-50">Anterior</button>
        <span className="py-2 text-gray-400">Página {page + 1}</span>
        <button onClick={() => onPageChange(page + 1)} disabled={songs.length < 20} className="px-4 py-2 bg-dark-700 rounded-lg disabled:opacity-50">Siguiente</button>
      </div>
    )}
  </div>
);
