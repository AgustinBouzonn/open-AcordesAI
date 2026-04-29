import React, { useEffect, useState } from 'react';
import { GraduationCap, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { Song } from '../../types';
import { api } from '../../services/apiClient';
import { Artwork } from '../Artwork';
import { useToast } from '../Toast';

interface Props {
  user?: { username: string } | null;
  onLogin: () => void;
  onSelectSong: (id: string) => void;
}

export const LearningPage: React.FC<Props> = ({ user, onLogin, onSelectSong }) => {
  const { showToast } = useToast();
  const [data, setData] = useState<{ learning: Song[]; learned: Song[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.progress.me()
      .then(setData)
      .catch(() => showToast('Error al cargar tu progreso', 'error'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
        <GraduationCap size={48} className="mx-auto mb-4 opacity-20" />
        <p className="mb-4">Iniciá sesión para llevar el progreso de tus canciones.</p>
        <button onClick={onLogin} className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg">Iniciar sesión</button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div>;
  if (!data) return null;

  const renderList = (songs: Song[], emptyText: string) => (
    songs.length === 0 ? (
      <p className="text-sm text-gray-500 text-center py-6">{emptyText}</p>
    ) : (
      <div className="space-y-2">
        {songs.map((song) => (
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
    )
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="text-brand" /> Mi progreso</h2>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm uppercase tracking-wider text-yellow-300 font-bold flex items-center gap-2">
            <GraduationCap size={14} /> Aprendiendo · {data.learning.length}
          </h3>
        </div>
        {renderList(data.learning, 'No tenés canciones marcadas como "aprendiendo".')}
      </section>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 size={14} /> Ya las sé · {data.learned.length}
          </h3>
        </div>
        {renderList(data.learned, 'Todavía no marcaste ninguna como sabida.')}
      </section>
    </div>
  );
};
