import React, { useEffect, useState } from 'react';
import { ListMusic, Plus, Trash2, Pencil, Check, X, Loader2, ChevronUp, ChevronDown, Music, Share2, Link as LinkIcon } from 'lucide-react';
import { Song } from '../../types';
import { api } from '../../services/apiClient';
import { useToast } from '../Toast';
import { Artwork } from '../Artwork';

interface SetlistRow {
  id: number;
  name: string;
  songCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SetlistDetail {
  id: number;
  name: string;
  shareToken: string | null;
  songs: (Song & { position: number })[];
}

interface Props {
  user?: { username: string } | null;
  onLogin: () => void;
  onSelectSong: (id: string) => void;
}

export const SetlistsPage: React.FC<Props> = ({ user, onLogin, onSelectSong }) => {
  const { showToast } = useToast();
  const [list, setList] = useState<SetlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SetlistDetail | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    void load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try { setList(await api.setlists.list()); } catch { showToast('Error al cargar setlists', 'error'); }
    finally { setLoading(false); }
  };

  const loadDetail = async (id: number) => {
    setOpenId(id);
    try { setDetail(await api.setlists.get(id)); } catch { showToast('Error al cargar setlist', 'error'); }
  };

  const create = async () => {
    if (!newName.trim()) return;
    try {
      await api.setlists.create(newName.trim());
      setNewName('');
      setCreating(false);
      await load();
      showToast('Setlist creada', 'success');
    } catch { showToast('Error al crear setlist', 'error'); }
  };

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar esta setlist?')) return;
    try {
      await api.setlists.remove(id);
      if (openId === id) { setOpenId(null); setDetail(null); }
      await load();
      showToast('Setlist eliminada', 'success');
    } catch { showToast('Error al eliminar', 'error'); }
  };

  const submitRename = async (id: number) => {
    if (!renameValue.trim()) return;
    try {
      await api.setlists.rename(id, renameValue.trim());
      setRenamingId(null);
      await load();
    } catch { showToast('Error al renombrar', 'error'); }
  };

  const removeSong = async (setlistId: number, songId: string) => {
    try {
      await api.setlists.removeSong(setlistId, songId);
      await loadDetail(setlistId);
      await load();
    } catch { showToast('Error al quitar', 'error'); }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    if (!detail) return;
    const next = [...detail.songs];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setDetail({ ...detail, songs: next });
    try { await api.setlists.reorder(detail.id, next.map((s) => s.id)); }
    catch { showToast('Error al reordenar', 'error'); await loadDetail(detail.id); }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
        <ListMusic size={48} className="mx-auto mb-4 opacity-20" />
        <p className="mb-4">Inicia sesión para crear y guardar setlists.</p>
        <button onClick={onLogin} className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg">Iniciar sesión</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><ListMusic className="text-brand" /> Mis Setlists</h2>
        {!creating && (
          <button onClick={() => setCreating(true)} className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Nueva
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void create(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Nombre de la setlist"
            className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
          />
          <button onClick={create} className="bg-brand hover:bg-brand/90 text-white px-4 rounded-lg"><Check size={16} /></button>
          <button onClick={() => { setCreating(false); setNewName(''); }} className="bg-dark-700 hover:bg-dark-600 text-gray-300 px-4 rounded-lg"><X size={16} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" size={32} /></div>
      ) : list.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Aún no creaste ninguna setlist.</div>
      ) : (
        <div className="space-y-3">
          {list.map((sl) => (
            <div key={sl.id} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                {renamingId === sl.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void submitRename(sl.id); if (e.key === 'Escape') setRenamingId(null); }}
                    className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-brand"
                  />
                ) : (
                  <button onClick={() => openId === sl.id ? setOpenId(null) : void loadDetail(sl.id)} className="flex-1 text-left">
                    <div className="font-bold text-white">{sl.name}</div>
                    <div className="text-xs text-gray-500">{sl.songCount} {sl.songCount === 1 ? 'canción' : 'canciones'}</div>
                  </button>
                )}
                {renamingId === sl.id ? (
                  <>
                    <button onClick={() => void submitRename(sl.id)} className="p-2 text-emerald-400 hover:text-emerald-300" aria-label="Confirmar"><Check size={16} /></button>
                    <button onClick={() => setRenamingId(null)} className="p-2 text-gray-400 hover:text-white" aria-label="Cancelar"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setRenamingId(sl.id); setRenameValue(sl.name); }} className="p-2 text-gray-400 hover:text-white" title="Renombrar" aria-label="Renombrar"><Pencil size={16} /></button>
                    <button onClick={() => void remove(sl.id)} className="p-2 text-gray-400 hover:text-red-400" title="Eliminar" aria-label="Eliminar"><Trash2 size={16} /></button>
                  </>
                )}
              </div>

              {openId === sl.id && detail && detail.id === sl.id && (
                <div className="border-t border-dark-700 bg-dark-900/50 p-3 space-y-2">
                  <div className="flex items-center gap-2 px-1 pb-2">
                    {detail.shareToken ? (
                      <>
                        <button
                          onClick={async () => {
                            const url = `${window.location.origin}/#/shared/setlist/${detail.shareToken}`;
                            try { await navigator.clipboard.writeText(url); showToast('Link copiado', 'success'); } catch { showToast(url, 'info', 8000); }
                          }}
                          className="text-xs flex items-center gap-1 bg-emerald-900/40 border border-emerald-700 text-emerald-200 px-2 py-1 rounded hover:bg-emerald-900/60"
                        >
                          <LinkIcon size={12} /> Copiar link público
                        </button>
                        <button
                          onClick={async () => { try { await api.setlists.unshare(sl.id); await loadDetail(sl.id); showToast('Link deshabilitado', 'success'); } catch { showToast('Error', 'error'); } }}
                          className="text-xs text-gray-400 hover:text-red-300"
                        >Dejar de compartir</button>
                      </>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            const { token } = await api.setlists.share(sl.id);
                            await loadDetail(sl.id);
                            const url = `${window.location.origin}/#/shared/setlist/${token}`;
                            try { await navigator.clipboard.writeText(url); showToast('Link copiado al portapapeles', 'success'); } catch { showToast(url, 'info', 8000); }
                          } catch { showToast('Error al generar link', 'error'); }
                        }}
                        className="text-xs flex items-center gap-1 bg-dark-700 hover:bg-dark-600 text-gray-300 px-2 py-1 rounded"
                      >
                        <Share2 size={12} /> Compartir setlist
                      </button>
                    )}
                  </div>
                  {detail.songs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Esta setlist está vacía. Agregá canciones desde el visor.</p>
                  ) : detail.songs.map((song, idx) => (
                    <div key={song.id} className="bg-dark-800 rounded-lg p-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6 text-center font-mono">{idx + 1}</span>
                      <Artwork size={36} url={song.artworkUrl} />
                      <button onClick={() => onSelectSong(song.id)} className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-white truncate">{song.title}</div>
                        <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                      </button>
                      <button onClick={() => void move(idx, -1)} disabled={idx === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-30" aria-label="Mover arriba"><ChevronUp size={14} /></button>
                      <button onClick={() => void move(idx, 1)} disabled={idx === detail.songs.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-30" aria-label="Mover abajo"><ChevronDown size={14} /></button>
                      <button onClick={() => void removeSong(sl.id, song.id)} className="p-1 text-gray-500 hover:text-red-400" aria-label="Quitar canción"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
