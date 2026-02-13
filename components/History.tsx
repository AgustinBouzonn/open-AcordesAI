import React from 'react';
import { Clock } from 'lucide-react';
import { getHistorySongsFull } from '../services/storageService';

interface HistoryProps {
  onLoadSong: (id: string, title?: string, artist?: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onLoadSong }) => {
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
            <div
              key={song.id}
              onClick={() => onLoadSong(song.id)}
              className="bg-dark-800 hover:bg-dark-700 p-4 rounded-xl cursor-pointer border border-dark-700 hover:border-brand/30 transition flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-white">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
              <div className="text-xs text-brand font-mono bg-brand/10 px-2 py-1 rounded">
                 {song.key}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
