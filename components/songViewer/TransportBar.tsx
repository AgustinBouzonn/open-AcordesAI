import React from 'react';
import { Type, Minus, Plus, PlayCircle, PauseCircle, Guitar } from 'lucide-react';

interface Props {
  fontSize: number;
  onFontSize: (next: number) => void;
  transpose: number;
  onTranspose: (next: number) => void;
  capo: number;
  onCapo: (next: number) => void;
  autoScrollSpeed: number;
  onAutoScrollSpeed: (next: number) => void;
}

export const TransportBar: React.FC<Props> = ({
  fontSize, onFontSize, transpose, onTranspose, capo, onCapo, autoScrollSpeed, onAutoScrollSpeed,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <button
        onClick={() => onFontSize(Math.max(12, fontSize - 2))}
        className="p-2 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Reducir tamaño de fuente"
      >
        <Minus size={16} />
      </button>
      <Type size={18} className="text-brand" />
      <button
        onClick={() => onFontSize(Math.min(24, fontSize + 2))}
        className="p-2 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Aumentar tamaño de fuente"
      >
        <Plus size={16} />
      </button>
    </div>

    <div className="flex items-center gap-2" aria-label="Transposición">
      <button
        onClick={() => onTranspose(transpose - 1)}
        className="px-3 py-1 bg-dark-700 rounded-lg text-gray-300 hover:bg-dark-600 min-h-[44px]"
        aria-label="Bajar un semitono"
      >
        −1
      </button>
      <span className="text-sm text-gray-400 min-w-[60px] text-center" aria-live="polite">
        {transpose === 0 ? 'Original' : transpose > 0 ? `+${transpose}` : transpose}
      </span>
      <button
        onClick={() => onTranspose(transpose + 1)}
        className="px-3 py-1 bg-dark-700 rounded-lg text-gray-300 hover:bg-dark-600 min-h-[44px]"
        aria-label="Subir un semitono"
      >
        +1
      </button>
    </div>

    <div
      className="flex items-center gap-2"
      title="Capo (cejilla virtual): bajá el cifrado para tocarlo con formas más cómodas"
    >
      <Guitar size={16} className="text-brand" />
      <button
        onClick={() => onCapo(Math.max(0, capo - 1))}
        className="px-2 py-1 bg-dark-700 rounded text-gray-300 hover:bg-dark-600 text-xs min-h-[36px]"
        aria-label="Bajar capo"
      >
        −
      </button>
      <span className="text-xs text-gray-400 min-w-[64px] text-center font-mono" aria-live="polite">
        Capo {capo === 0 ? '—' : capo}
      </span>
      <button
        onClick={() => onCapo(Math.min(12, capo + 1))}
        className="px-2 py-1 bg-dark-700 rounded text-gray-300 hover:bg-dark-600 text-xs min-h-[36px]"
        aria-label="Subir capo"
      >
        +
      </button>
    </div>

    <div className="flex items-center gap-1">
      {autoScrollSpeed > 0 && (
        <>
          <button
            onClick={() => onAutoScrollSpeed(Math.max(1, autoScrollSpeed - 1))}
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Bajar velocidad de autoscroll"
          >
            <Minus size={13} />
          </button>
          <span className="text-xs text-brand font-mono w-4 text-center" aria-live="polite">{autoScrollSpeed}</span>
          <button
            onClick={() => onAutoScrollSpeed(Math.min(5, autoScrollSpeed + 1))}
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Subir velocidad de autoscroll"
          >
            <Plus size={13} />
          </button>
        </>
      )}
      <button
        onClick={() => onAutoScrollSpeed(autoScrollSpeed === 0 ? 1 : 0)}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition min-h-[44px] ${
          autoScrollSpeed > 0 ? 'bg-brand text-white' : 'bg-dark-700 text-gray-300'
        }`}
        aria-pressed={autoScrollSpeed > 0}
      >
        {autoScrollSpeed > 0 ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
        <span>{autoScrollSpeed > 0 ? 'Pausar' : 'Autoscroll'}</span>
      </button>
    </div>
  </div>
);
