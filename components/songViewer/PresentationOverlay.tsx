import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { acquireWakeLock, releaseWakeLock } from '../../services/wakeLock';

interface Props {
  title: string;
  artist: string;
  chords: string;
  fontSize: number;
  onClose: () => void;
}

export const PresentationOverlay: React.FC<Props> = ({ title, artist, chords, fontSize, onClose }) => {
  useEffect(() => {
    void acquireWakeLock();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      void releaseWakeLock();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modo presentación"
      className="fixed inset-0 bg-dark-900 z-[1200] overflow-auto p-6 md:p-12"
    >
      <button
        onClick={onClose}
        autoFocus
        className="fixed top-4 right-4 z-10 p-3 rounded-full bg-dark-800/80 backdrop-blur text-gray-300 hover:text-white border border-dark-700 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Salir del modo presentación (Esc)"
        title="Salir (Esc)"
      >
        <X size={20} />
      </button>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-400 bg-dark-800/80 backdrop-blur px-3 py-1.5 rounded-full border border-dark-700">
        Presiona <kbd className="font-mono">ESC</kbd> para salir
      </div>
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">{title}</h1>
        <p className="text-brand mb-6 text-sm md:text-base">{artist}</p>
        <pre style={{ fontSize: `${fontSize + 2}px`, lineHeight: 1.7 }} className="font-mono whitespace-pre-wrap text-gray-100">
          {chords}
        </pre>
      </div>
    </div>
  );
};
