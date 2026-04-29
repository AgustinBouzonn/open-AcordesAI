import React, { useEffect, useState } from 'react';
import { Search, AudioWaveform, Music, ListMusic, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'acordesai_onboarded_v1';

interface Slide {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  { icon: <Search size={36} />, title: 'Buscá cualquier canción', body: 'Pegá un link de Cifra Club o buscá por título y artista. También podés buscar por progresión de acordes que ya sepas tocar.' },
  { icon: <AudioWaveform size={36} />, title: 'Afinador profesional', body: 'McLeod Pitch sobre Web Audio. 13 afinaciones para guitarra y ukelele, calibración A4, tono de referencia y vibración cuando estás afinado.' },
  { icon: <Music size={36} />, title: 'Metrónomo + capo + autoscroll', body: 'Metrónomo con tap tempo y subdivisiones. Capo virtual y transpose en el visor. Autoscroll con loop de sección para practicar.' },
  { icon: <ListMusic size={36} />, title: 'Setlists para tocar en vivo', body: 'Armá listas de canciones, ordenálas, modo presentación fullscreen y exportá a PDF para llevar el atril offline.' },
];

export const OnboardingModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch { /* private mode etc. */ }
  }, []);

  if (!open) return null;

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setOpen(false);
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 z-[1100] flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button onClick={close} aria-label="Cerrar" className="absolute top-3 right-3 text-gray-400 hover:text-white"><X size={20} /></button>

        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/20 text-brand mb-4">
            {slide.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{slide.body}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Ir al paso ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-brand' : 'w-1.5 bg-dark-600'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={close} className="text-sm text-gray-400 hover:text-white">Saltar</button>
          {isLast ? (
            <button onClick={close} className="bg-brand hover:bg-brand/90 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              Empezar <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={() => setStep(step + 1)} className="bg-brand hover:bg-brand/90 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              Siguiente <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
