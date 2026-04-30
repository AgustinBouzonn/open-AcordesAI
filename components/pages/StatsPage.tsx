import React, { useEffect, useState } from 'react';
import { Loader2, Activity, Clock, Music2, Flame } from 'lucide-react';
import { api } from '../../services/apiClient';
import { Song, User } from '../../types';

interface Props {
  user: User | null;
  onLogin: () => void;
  onSelectSong: (id: string) => void;
}

interface StatsData {
  totalSec: number;
  sessions: number;
  uniqueSongs: number;
  byDay: { day: string; sec: number }[];
  topSongs: (Song & { practicedSec: number; sessions: number })[];
}

const formatHM = (sec: number): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
};

const dayLabel = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

export const StatsPage: React.FC<Props> = ({ user, onLogin, onSelectSong }) => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.practice.stats()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <Activity size={48} className="mx-auto text-brand mb-4" />
        <p className="text-gray-400 mb-4">Iniciá sesión para ver tus estadísticas de práctica.</p>
        <button onClick={onLogin} className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-lg font-medium">
          Iniciar sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={40} /></div>;
  }

  if (error) {
    return <p className="text-center text-red-400 py-10">{error}</p>;
  }

  if (!data) return null;

  const maxDay = Math.max(1, ...data.byDay.map((d) => d.sec));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Tus estadísticas</h1>
        <p className="text-gray-400 text-sm">Tiempo en cifrados, sesiones y canciones más tocadas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <Clock className="text-brand mb-2" size={24} />
          <p className="text-3xl font-bold text-white">{formatHM(data.totalSec)}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Tiempo total</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <Flame className="text-brand mb-2" size={24} />
          <p className="text-3xl font-bold text-white">{data.sessions}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Sesiones</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <Music2 className="text-brand mb-2" size={24} />
          <p className="text-3xl font-bold text-white">{data.uniqueSongs}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Canciones distintas</p>
        </div>
      </div>

      <section className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <h2 className="text-lg font-semibold text-white mb-4">Últimos 30 días</h2>
        {data.byDay.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin actividad reciente. Abrí una canción y empezá a practicar.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {data.byDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                <div
                  className="w-full bg-brand/70 group-hover:bg-brand rounded-t transition"
                  style={{ height: `${Math.max(2, (d.sec / maxDay) * 100)}%` }}
                  title={`${dayLabel(d.day)}: ${formatHM(d.sec)}`}
                />
                <span className="text-[10px] text-gray-500 transform -rotate-45 origin-left whitespace-nowrap mt-1">
                  {dayLabel(d.day)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <h2 className="text-lg font-semibold text-white mb-4">Más practicadas</h2>
        {data.topSongs.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no hay datos. Abrí una canción y dejala en pantalla mientras practicás.</p>
        ) : (
          <ul className="divide-y divide-dark-700">
            {data.topSongs.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onSelectSong(s.id)}
                  className="w-full text-left py-3 flex items-center justify-between hover:bg-dark-700 px-2 rounded transition"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{s.title}</p>
                    <p className="text-xs text-brand truncate">{s.artist}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm text-white font-medium">{formatHM(s.practicedSec)}</p>
                    <p className="text-xs text-gray-500">{s.sessions} {s.sessions === 1 ? 'sesión' : 'sesiones'}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
