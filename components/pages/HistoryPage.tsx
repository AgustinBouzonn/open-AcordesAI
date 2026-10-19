import React from 'react';
import { Clock } from 'lucide-react';
import { Song } from '../../types';
import { Artwork } from '../Artwork';
import { CardButton } from '../CardButton';

interface Props {
  history: Song[];
  onSelectSong: (id: string) => void;
}

export const HistoryPage: React.FC<Props> = ({ history, onSelectSong }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="text-brand" />Historial Reciente</h1>
    {history.length === 0 ? (
      <div className="text-center text-gray-400 mt-20">
        <Clock size={48} className="mx-auto mb-4 opacity-20" />
        <p>Las últimas canciones que veas aparecerán aquí.</p>
      </div>
    ) : (
      <div className="space-y-2">
        {history.map((song) => (
          <div key={song.id} className="relative bg-dark-800 hover:bg-dark-700 p-3 rounded-xl border border-dark-700 hover:border-brand/30 transition flex items-center gap-3">
            <Artwork size={48} />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white"><CardButton onClick={() => onSelectSong(song.id)}>{song.title}</CardButton></h2>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
