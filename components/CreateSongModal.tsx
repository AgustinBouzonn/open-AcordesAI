import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; artist: string; lyrics?: string }) => void;
}

export function CreateSongModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), artist: artist.trim(), lyrics: lyrics.trim() || undefined });
      setTitle('');
      setArtist('');
      setLyrics('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeStyle}><X size={20} /></button>
        
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Crear nueva canción
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la canción"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Artista *
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nombre del artista"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Letra (opcional)
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Pega la letra aquí..."
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !artist.trim()}
              style={{ ...primaryButtonStyle, opacity: loading || !title.trim() || !artist.trim() ? 0.5 : 1 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> : <Send size={18} style={{ marginRight: '0.5rem' }} />}
              Crear canción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#1e1e1e', padding: '1.5rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', position: 'relative',
};

const closeStyle: React.CSSProperties = {
  position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #374151', background: '#0f0f0f', color: '#fff', fontSize: '0.875rem',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#374151', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#4f46e5', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer',
};
