import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Loader2, ListMusic } from 'lucide-react';
import { api } from '../services/apiClient';
import { useToast } from './Toast';
import { useModalA11y } from './hooks/useModalA11y';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export const AddToSetlistModal: React.FC<Props> = ({ isOpen, onClose, songId }) => {
  const { showToast } = useToast();
  const [list, setList] = useState<{ id: number; name: string; songCount: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalA11y(isOpen, onClose, dialogRef);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.setlists.list().then(setList).catch(() => showToast('Error al cargar setlists', 'error')).finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const add = async (id: number) => {
    setAdding(id);
    try {
      await api.setlists.addSong(id, songId);
      showToast('Agregada a la setlist', 'success');
      onClose();
    } catch { showToast('Error al agregar', 'error'); }
    finally { setAdding(null); }
  };

  const create = async () => {
    if (!newName.trim()) return;
    try {
      const created = await api.setlists.create(newName.trim());
      await api.setlists.addSong(created.id, songId);
      showToast(`Agregada a "${created.name}"`, 'success');
      onClose();
    } catch { showToast('Error al crear setlist', 'error'); }
  };

  return (
    <div style={overlay} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        style={modal}
        role="dialog"
        aria-modal="true"
        aria-label="Agregar a setlist"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={closeBtn} aria-label="Cerrar"><X size={20} /></button>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><ListMusic className="text-brand" size={20} /> Agregar a setlist</h2>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-brand" size={24} /></div>
        ) : list.length === 0 && !showCreate ? (
          <p className="text-sm text-gray-400 py-4 text-center">Aún no tenés setlists. Creá una.</p>
        ) : (
          <div className="space-y-1 mb-3 max-h-72 overflow-y-auto">
            {list.map((sl) => (
              <button
                key={sl.id}
                onClick={() => add(sl.id)}
                disabled={adding === sl.id}
                className="w-full bg-dark-900 hover:bg-dark-700 border border-dark-700 rounded-lg p-3 text-left flex justify-between items-center transition disabled:opacity-50"
              >
                <div>
                  <div className="text-sm font-medium text-white">{sl.name}</div>
                  <div className="text-xs text-gray-500">{sl.songCount} {sl.songCount === 1 ? 'canción' : 'canciones'}</div>
                </div>
                {adding === sl.id ? <Loader2 className="animate-spin text-brand" size={16} /> : <Plus size={16} className="text-gray-400" />}
              </button>
            ))}
          </div>
        )}

        {showCreate ? (
          <div className="flex gap-2 pt-3 border-t border-dark-700">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void create(); if (e.key === 'Escape') setShowCreate(false); }}
              placeholder="Nombre de la setlist"
              className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
            <button onClick={create} className="bg-brand hover:bg-brand/90 text-white px-4 rounded-lg">Crear</button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Crear nueva setlist
          </button>
        )}
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#1e1e1e', padding: '1.5rem', borderRadius: '0.75rem', width: '100%', maxWidth: '440px', position: 'relative', margin: '0 1rem' };
const closeBtn: React.CSSProperties = { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' };
