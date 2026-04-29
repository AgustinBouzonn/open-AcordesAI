import React, { useState } from 'react';
import { X, Loader2, Download, Copy } from 'lucide-react';
import { api } from '../services/apiClient';
import { Song } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImported: (song: Song) => void;
}

export function ImportUrlModal({ isOpen, onClose, onImported }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  if (!isOpen) return null;

  const handleImport = async () => {
    const clean = url.trim();
    if (!clean) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const { song, existed } = await api.imports.fromUrl(clean);
      if (existed) setNotice('Esta canción ya estaba en la biblioteca. Abriendo…');
      onImported(song);
      setUrl('');
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo importar la URL');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {}
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeStyle}><X size={20} /></button>

        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Importar desde URL
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Pegá una URL de Cifra Club y se crea la canción con letra y acordes.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.cifraclub.com/..."
            disabled={loading}
            onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={handlePaste} style={iconButtonStyle} title="Pegar" disabled={loading}>
            <Copy size={18} />
          </button>
        </div>

        {notice && <p style={{ color: '#9ca3af', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{notice}</p>}
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelButtonStyle} disabled={loading}>Cancelar</button>
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            style={{ ...primaryButtonStyle, opacity: loading || !url.trim() ? 0.5 : 1 }}
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} />
              : <Download size={18} style={{ marginRight: '0.5rem' }} />}
            {loading ? 'Importando…' : 'Importar'}
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #374151' }}>
          <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            Fuente soportada: <span style={{ color: '#9ca3af' }}>Cifra Club</span>.
          </p>
        </div>
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
const iconButtonStyle: React.CSSProperties = {
  padding: '0.75rem', background: '#374151', border: 'none', borderRadius: '0.5rem', color: '#9ca3af', cursor: 'pointer',
};
const cancelButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#374151', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer',
};
const primaryButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#4f46e5', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer',
};
