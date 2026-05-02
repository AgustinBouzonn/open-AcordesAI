import React, { useState } from 'react';
import { Youtube, Edit2, X, Check, Trash2 } from 'lucide-react';
import { useToast } from './Toast';
import { api } from '../services/apiClient';

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/.*[?&]v=([A-Za-z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

interface Props {
  songId: string;
  initialUrl?: string;
  canEdit: boolean;
  onUrlChange?: (url: string | null) => void;
}

export const YouTubePlayer: React.FC<Props> = ({ songId, initialUrl, canEdit, onUrlChange }) => {
  const { showToast } = useToast();
  const [url, setUrl] = useState(initialUrl || '');
  const [editing, setEditing] = useState(!initialUrl);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const videoId = extractVideoId(url);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!extractVideoId(trimmed)) { showToast('URL de YouTube inválida', 'error'); return; }
    setSaving(true);
    try {
      await api.songs.setYoutube(songId, trimmed);
      setUrl(trimmed);
      setEditing(false);
      setDraft('');
      onUrlChange?.(trimmed);
      showToast('Video asociado', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo guardar', 'error');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.songs.setYoutube(songId, null);
      setUrl('');
      onUrlChange?.(null);
      showToast('Video quitado', 'success');
    } catch { showToast('Error', 'error'); }
    finally { setSaving(false); }
  };

  if (!canEdit && !videoId) return null;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300">
        <span className="flex items-center gap-2"><Youtube size={16} className="text-red-500" /> Video</span>
        {canEdit && videoId && !editing && (
          <div className="flex gap-1">
            <button onClick={() => { setEditing(true); setDraft(url); }} className="p-1 text-gray-400 hover:text-white" title="Editar"><Edit2 size={14} /></button>
            <button onClick={remove} disabled={saving} className="p-1 text-gray-400 hover:text-red-400" title="Quitar"><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      {videoId && !editing && (
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {canEdit && (editing || !videoId) && (
        <div className="flex gap-2 p-3 border-t border-dark-700">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void save(); if (e.key === 'Escape') { setEditing(false); setDraft(''); } }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 bg-dark-900 border border-dark-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
          />
          <button onClick={save} disabled={saving || !draft.trim()} className="bg-brand hover:bg-brand/90 text-white px-3 rounded disabled:opacity-50" aria-label="Confirmar"><Check size={16} /></button>
          {videoId && <button onClick={() => { setEditing(false); setDraft(''); }} className="bg-dark-700 hover:bg-dark-600 text-gray-300 px-3 rounded" aria-label="Cancelar"><X size={16} /></button>}
        </div>
      )}
    </div>
  );
};
