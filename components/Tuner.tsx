import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, AudioWaveform, Settings2, Volume2, Check } from 'lucide-react';
import { TunerEngine, TunerSample } from '../services/tunerEngine';
import { playReferenceTone, stopReferenceTone } from '../services/referenceTone';
import { acquireWakeLock, releaseWakeLock } from '../services/wakeLock';
import { TUNINGS, Tuning, frequencyToNote, closestStringIndex, centsFromTarget, rebuildTuningWithA4 } from '../data/tunings';

type InstrumentUI = 'electric' | 'classical' | 'ukulele';

const TUNED_TOLERANCE = 5;

function pickDefaultTuning(ui: InstrumentUI): Tuning {
  const wanted = ui === 'ukulele' ? 'ukulele' : 'guitar';
  return TUNINGS.find((t) => t.instrument === wanted) ?? TUNINGS[0];
}

export const Tuner: React.FC = () => {
  const [instrument, setInstrument] = useState<InstrumentUI>('electric');
  const [tuningId, setTuningId] = useState<string>(() => pickDefaultTuning('electric').id);
  const [autoDetect, setAutoDetect] = useState(true);
  const [manualStringIdx, setManualStringIdx] = useState(0);
  const [a4, setA4] = useState(440);
  const [showSettings, setShowSettings] = useState(false);

  const [running, setRunning] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [sample, setSample] = useState<TunerSample>({ freq: 0, clarity: 0, rms: 0, hasSignal: false });

  const engineRef = useRef<TunerEngine | null>(null);
  if (!engineRef.current) engineRef.current = new TunerEngine();
  const lastInTuneRef = useRef(false);

  const tuning = useMemo(() => {
    const base = TUNINGS.find((t) => t.id === tuningId) ?? TUNINGS[0];
    return a4 === 440 ? base : rebuildTuningWithA4(base, a4);
  }, [tuningId, a4]);

  const availableTunings = useMemo(() => {
    const wanted = instrument === 'ukulele' ? 'ukulele' : 'guitar';
    return TUNINGS.filter((t) => t.instrument === wanted);
  }, [instrument]);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      stopReferenceTone();
      void releaseWakeLock();
    };
  }, []);

  const handleInstrument = (i: InstrumentUI) => {
    setInstrument(i);
    const next = pickDefaultTuning(i);
    setTuningId(next.id);
    setManualStringIdx(0);
  };

  const start = async () => {
    setPermissionError(null);
    try {
      await engineRef.current!.start(setSample);
      setRunning(true);
      void acquireWakeLock();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo acceder al micrófono';
      setPermissionError(msg);
      setRunning(false);
    }
  };

  const stop = () => {
    engineRef.current?.stop();
    setRunning(false);
    setSample({ freq: 0, clarity: 0, rms: 0, hasSignal: false });
    lastInTuneRef.current = false;
    void releaseWakeLock();
  };

  const targetIdx = useMemo(() => {
    if (!sample.hasSignal) return autoDetect ? -1 : manualStringIdx;
    return autoDetect ? closestStringIndex(sample.freq, tuning.strings) : manualStringIdx;
  }, [sample, autoDetect, manualStringIdx, tuning]);

  const targetString = targetIdx >= 0 ? tuning.strings[targetIdx] : null;
  const cents = targetString && sample.hasSignal ? centsFromTarget(sample.freq, targetString.freq) : 0;
  const note = sample.hasSignal ? frequencyToNote(sample.freq, a4) : null;
  const inTune = sample.hasSignal && Math.abs(cents) <= TUNED_TOLERANCE;

  useEffect(() => {
    if (inTune && !lastInTuneRef.current && navigator.vibrate) {
      navigator.vibrate(40);
    }
    lastInTuneRef.current = inTune;
  }, [inTune]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
          <AudioWaveform className="text-brand" size={28} /> Afinador
        </h2>
        <p className="text-gray-400 text-sm mt-1">Profesional · McLeod Pitch · Guitarra · Ukelele</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'electric', label: 'Eléctrica' },
          { id: 'classical', label: 'Criolla' },
          { id: 'ukulele', label: 'Ukelele' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleInstrument(id as InstrumentUI)}
            className={`py-2 rounded-lg text-sm font-medium border transition ${
              instrument === id
                ? 'bg-brand text-white border-brand shadow'
                : 'bg-dark-800 text-gray-300 border-dark-700 hover:bg-dark-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={tuningId}
          onChange={(e) => { setTuningId(e.target.value); setManualStringIdx(0); }}
          className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand"
        >
          {availableTunings.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-gray-300 hover:bg-dark-700"
          title="Ajustes"
        >
          <Settings2 size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-300">Modo</span>
            <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
              <button
                onClick={() => setAutoDetect(true)}
                className={`px-3 py-1 text-xs rounded ${autoDetect ? 'bg-brand text-white' : 'text-gray-400'}`}
              >Auto</button>
              <button
                onClick={() => setAutoDetect(false)}
                className={`px-3 py-1 text-xs rounded ${!autoDetect ? 'bg-brand text-white' : 'text-gray-400'}`}
              >Manual</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-300">Calibración A4</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={430}
                max={446}
                step={1}
                value={a4}
                onChange={(e) => setA4(parseInt(e.target.value, 10))}
                className="w-32 accent-brand"
              />
              <span className="text-sm font-mono text-brand w-16 text-right">{a4} Hz</span>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-dark-800 border rounded-2xl p-6 transition-colors ${inTune ? 'border-emerald-500 shadow-emerald-500/20 shadow-lg' : 'border-dark-700'}`}>
        <div className="flex items-baseline justify-center gap-3">
          <div className={`text-7xl font-black tracking-tight tabular-nums ${
            !sample.hasSignal ? 'text-gray-600'
              : inTune ? 'text-emerald-400'
              : Math.abs(cents) < 20 ? 'text-yellow-400'
              : 'text-red-400'
          }`}>
            {note ? note.name : '—'}
          </div>
          {note && (<span className="text-2xl text-gray-500 font-mono">{note.octave}</span>)}
        </div>

        <div className="text-center text-xs text-gray-500 -mt-1 mb-4 font-mono">
          {sample.hasSignal
            ? `${sample.freq.toFixed(2)} Hz · ${cents > 0 ? '+' : ''}${cents}¢`
            : 'Tocá una cuerda…'}
        </div>

        <Needle cents={cents} active={sample.hasSignal} />

        {targetString && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Apuntando a <span className="text-brand font-semibold">{targetString.note}{targetString.octave}</span> ({targetString.freq.toFixed(2)} Hz)
            {inTune && <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 font-semibold"><Check size={14} /> Afinado</span>}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {running ? (
          <button onClick={stop} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
            <MicOff size={18} /> Detener
          </button>
        ) : (
          <button onClick={start} className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
            <Mic size={18} /> Activar micrófono
          </button>
        )}
      </div>

      {permissionError && (
        <div className="bg-red-950/50 border border-red-800 text-red-200 text-sm p-3 rounded-lg">
          {permissionError}. En Android, otorgá el permiso de micrófono desde Ajustes &rarr; Aplicaciones &rarr; AcordesAI.
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
          <Volume2 size={14} /> Cuerdas — tocá una para escuchar el tono
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {tuning.strings.map((s, i) => {
            const active = targetIdx === i;
            const tunedThis = active && inTune;
            return (
              <button
                key={`${s.note}${s.octave}-${i}`}
                onClick={() => { playReferenceTone(s.freq); if (!autoDetect) setManualStringIdx(i); }}
                className={`relative py-3 rounded-lg text-center font-semibold border transition ${
                  tunedThis ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                    : active ? 'bg-brand/20 border-brand text-brand'
                    : 'bg-dark-800 border-dark-700 text-gray-300 hover:bg-dark-700'
                }`}
              >
                <div className="text-lg leading-none">{s.note}<span className="text-xs text-gray-500 font-mono">{s.octave}</span></div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">{s.freq.toFixed(1)} Hz</div>
                {tunedThis && <Check size={14} className="absolute top-1 right-1 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Needle: React.FC<{ cents: number; active: boolean }> = ({ cents, active }) => {
  const clamped = Math.max(-50, Math.min(50, cents));
  const angle = (clamped / 50) * 45;
  const inTune = active && Math.abs(cents) <= TUNED_TOLERANCE;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 200 110" className="w-full">
        <defs>
          <linearGradient id="arc" x1="0" x2="1">
            <stop offset="0" stopColor="#ef4444" />
            <stop offset="0.45" stopColor="#facc15" />
            <stop offset="0.5" stopColor="#10b981" />
            <stop offset="0.55" stopColor="#facc15" />
            <stop offset="1" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="url(#arc)" strokeWidth="6" fill="none" strokeLinecap="round" opacity={active ? 1 : 0.3} />
        {[-50, -25, 0, 25, 50].map((tick) => {
          const t = (tick / 50) * 45;
          const rad = (t - 90) * Math.PI / 180;
          const x1 = 100 + 70 * Math.cos(rad);
          const y1 = 100 + 70 * Math.sin(rad);
          const x2 = 100 + 78 * Math.cos(rad);
          const y2 = 100 + 78 * Math.sin(rad);
          return (
            <g key={tick}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="1.5" />
              <text x={100 + 60 * Math.cos(rad)} y={100 + 60 * Math.sin(rad) + 3} fontSize="7" fill="#6b7280" textAnchor="middle">{tick}</text>
            </g>
          );
        })}
        <g style={{ transition: 'transform 90ms linear', transformOrigin: '100px 100px' }} transform={`rotate(${angle})`}>
          <line x1="100" y1="100" x2="100" y2="28" stroke={inTune ? '#10b981' : active ? '#fff' : '#4b5563'} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="28" r="4" fill={inTune ? '#10b981' : active ? '#fff' : '#4b5563'} />
        </g>
        <circle cx="100" cy="100" r="6" fill="#1f2937" stroke="#9ca3af" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
