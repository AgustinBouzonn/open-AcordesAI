import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export function ShareModal({ isOpen, onClose, songId }: Props) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/song/${songId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mirá estos acordes',
          text: `Acordes de canción en AcordesAI: ${shareUrl}`,
          url: shareUrl
        });
      } catch {}
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=Mirá estos acordes: ${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Mirá estos acordes&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeStyle}><X size={20} /></button>
        
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Compartir canción
        </h2>

        <div className="space-y-3">
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            <span>{copied ? 'Copiado!' : 'Copiar enlace'}</span>
          </button>

          <button
            onClick={shareNative}
            className="w-full flex items-center justify-center gap-2 p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
          >
            <span>Compartir...</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={shareWhatsApp} className="flex flex-col items-center gap-1 p-3 bg-[#25D366] hover:bg-[#20BD5A] rounded-lg transition">
              <span style={{ fontSize: '24px' }}>💬</span>
              <span className="text-xs">WhatsApp</span>
            </button>
            <button onClick={shareTwitter} className="flex flex-col items-center gap-1 p-3 bg-[#1DA1F2] hover:bg-[#1A91DA] rounded-lg transition">
              <span style={{ fontSize: '24px' }}>🐦</span>
              <span className="text-xs">Twitter</span>
            </button>
            <button onClick={shareFacebook} className="flex flex-col items-center gap-1 p-3 bg-[#4267B2] hover:bg-[#3B5998] rounded-lg transition">
              <span style={{ fontSize: '24px' }}>📘</span>
              <span className="text-xs">Facebook</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-dark-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Enlace directo</p>
            <p className="text-sm text-brand truncate">{shareUrl}</p>
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
  background: '#1e1e1e', padding: '1.5rem', borderRadius: '0.75rem', width: '100%', maxWidth: '400px', position: 'relative',
};

const closeStyle: React.CSSProperties = {
  position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
};
