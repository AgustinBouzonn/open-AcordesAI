import React, { useState } from 'react';
import { X, Loader2, ExternalLink, Copy } from 'lucide-react';
import { api } from '../services/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (chords: string) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');

    try {
      const data = await api.imports.fetch(url);
      if (data.chords) {
        onImport(data.chords);
        onClose();
        setUrl('');
      } else {
        setError('No se pudo extraer el cifrado');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al importar. Verificá la URL.');
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
        
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Importar cifrado desde URL
        </h2>

        <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Pegá la URL de una página con cifrados (Ultimate Guitar, Cifra Club, etc.)
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={handlePaste} style={{ ...iconButtonStyle }} title="Pegar">
            <Copy size={18} />
          </button>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelButtonStyle}>
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            style={{ ...primaryButtonStyle, opacity: loading || !url.trim() ? 0.5 : 1 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> : <ExternalLink size={18} style={{ marginRight: '0.5rem' }} />}
            Importar
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Fuentes soportadas:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Ultimate Guitar', 'Cifra Club', 'CifraSpot', 'GuitarTabs', 'GoChords'].map(s => (
              <span key={s} style={{ background: '#374151', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                {s}
              </span>
            ))}
          </div>
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
