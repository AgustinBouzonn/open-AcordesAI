import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListMusic, Loader2, Music2 } from 'lucide-react';
import { Song } from '../../types';
import { api } from '../../services/apiClient';
import { Artwork } from '../Artwork';
import { CardButton } from '../CardButton';

export const PublicSetlistPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ id: number; name: string; owner: string; songs: (Song & { position: number })[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.setlists.getPublic(token)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={40} /></div>;
  }

  if (error || !data) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p>{error || 'Setlist no disponible'}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand">Ir al inicio</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-brand/20 p-3 rounded-xl text-brand"><ListMusic size={28} /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">{data.name}</h1>
          <p className="text-sm text-gray-400">por <span className="text-brand">{data.owner}</span> · {data.songs.length} {data.songs.length === 1 ? 'canción' : 'canciones'}</p>
        </div>
      </div>

      {data.songs.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-dark-800 rounded-xl border border-dashed border-dark-600">
          <Music2 size={48} className="mx-auto mb-4 opacity-20" />
          <p>Esta setlist está vacía.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.songs.map((song, idx) => (
            <div key={song.id} className="relative bg-dark-800 hover:bg-dark-700 p-3 rounded-xl border border-dark-700 hover:border-brand/40 transition flex items-center gap-3">
              <span className="text-xs text-gray-400 w-6 text-center font-mono">{idx + 1}</span>
              <Artwork size={48} url={song.artworkUrl} />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-white"><CardButton onClick={() => navigate(`/song/${song.id}`)}>{song.title}</CardButton></h2>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
