import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, Hand, Music } from 'lucide-react';
import { MetronomeEngine } from '../services/metronomeEngine';
import { acquireWakeLock, releaseWakeLock } from '../services/wakeLock';

const TIME_SIGNATURES = [
  { id: '2/4', beats: 2, sub: 1 },
  { id: '3/4', beats: 3, sub: 1 },
  { id: '4/4', beats: 4, sub: 1 },
  { id: '5/4', beats: 5, sub: 1 },
  { id: '6/8', beats: 6, sub: 1 },
  { id: '7/8', beats: 7, sub: 1 },
  { id: '9/8', beats: 9, sub: 1 },
  { id: '12/8', beats: 12, sub: 1 },
] as const;

const SUBDIVISIONS = [
  { id: 1, label: '♩', name: 'Negras' },
  { id: 2, label: '♫', name: 'Corcheas' },
  { id: 3, label: '♫₃', name: 'Tresillos' },
  { id: 4, label: '♬', name: 'Semicorcheas' },
] as const;

const BPM_PRESETS = [
  { bpm: 60, label: 'Largo' },
  { bpm: 80, label: 'Andante' },
  { bpm: 100, label: 'Moderato' },
  { bpm: 120, label: 'Allegro' },
  { bpm: 144, label: 'Vivace' },
  { bpm: 180, label: 'Presto' },
];

export const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [tsId, setTsId] = useState<typeof TIME_SIGNATURES[number]['id']>('4/4');
  const [subId, setSubId] = useState<typeof SUBDIVISIONS[number]['id']>(1);
  const [volume, setVolume] = useState(0.7);
  const [running, setRunning] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);

  const engineRef = useRef<MetronomeEngine | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  if (!engineRef.current) engineRef.current = new MetronomeEngine();

  const ts = useMemo(() => TIME_SIGNATURES.find((t) => t.id === tsId) ?? TIME_SIGNATURES[2], [tsId]);

  useEffect(() => () => {
    engineRef.current?.destroy();
    void releaseWakeLock();
  }, []);

  useEffect(() => {
    if (running) engineRef.current?.setBpm(bpm);
  }, [bpm, running]);

  useEffect(() => {
    if (running) engineRef.current?.setVolume(volume);
  }, [volume, running]);

  const start = () => {
    engineRef.current!.start({
      bpm,
      beatsPerBar: ts.beats,
      subdivisions: subId,
      volume,
      onTick: ({ beat, subBeat }) => { if (subBeat === 0) setActiveBeat(beat); },
    });
    setRunning(true);
    void acquireWakeLock();
  };

  const stop = () => {
    engineRef.current?.stop();
    setRunning(false);
    setActiveBeat(-1);
    void releaseWakeLock();
  };

  const toggle = () => (running ? stop() : start());

  const handleTap = () => {
    const now = performance.now();
    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 2500);
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length < 2) return;
    const intervals: number[] = [];
    for (let i = 1; i < tapTimesRef.current.length; i++) {
      intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const detected = Math.round(60000 / avg);
    if (detected >= 40 && detected <= 240) setBpm(detected);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
          <Music className="text-brand" size={28} /> Metrónomo
        </h2>
        <p className="text-gray-400 text-sm mt-1">Scheduler look-ahead Web Audio · Timing sub-milisegundo</p>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-6">
        <div className="text-center">
          <div className="text-7xl font-black tabular-nums text-brand">{bpm}</div>
          <div className="text-xs uppercase text-gray-500 tracking-wider mt-1">BPM</div>
        </div>

        <input
          type="range"
          min={40}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="w-full accent-brand"
        />

        <div className="grid grid-cols-3 gap-2">
          {BPM_PRESETS.map((p) => (
            <button
              key={p.bpm}
              onClick={() => setBpm(p.bpm)}
              className={`py-2 rounded-lg text-xs font-medium border transition ${
                bpm === p.bpm ? 'bg-brand text-white border-brand' : 'bg-dark-900 text-gray-300 border-dark-700 hover:bg-dark-700'
              }`}
            >
              {p.bpm} · {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: ts.beats }).map((_, i) => (
            <div
              key={i}
              className={`w-9 h-9 rounded-full border-2 transition-all duration-75 ${
                activeBeat === i
                  ? i === 0
                    ? 'bg-brand border-brand scale-125 shadow-lg shadow-brand/50'
                    : 'bg-emerald-500 border-emerald-500 scale-110'
                  : 'border-dark-600'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={toggle}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transition ${
              running ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand/90'
            }`}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
            {running ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={handleTap}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-dark-700 hover:bg-dark-600 text-white shadow-lg"
            title="Tocá al ritmo para detectar el BPM"
          >
            <Hand size={18} /> Tap
          </button>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-gray-300">Compás</span>
          <div className="flex gap-1 flex-wrap">
            {TIME_SIGNATURES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTsId(t.id)}
                className={`px-3 py-1 rounded text-sm font-mono ${tsId === t.id ? 'bg-brand text-white' : 'bg-dark-900 text-gray-400 hover:bg-dark-700'}`}
              >{t.id}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-gray-300">Subdivisión</span>
          <div className="flex gap-1">
            {SUBDIVISIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubId(s.id)}
                title={s.name}
                className={`px-3 py-1 rounded text-base ${subId === s.id ? 'bg-brand text-white' : 'bg-dark-900 text-gray-400 hover:bg-dark-700'}`}
              >{s.label}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-300 flex items-center gap-2"><Volume2 size={16} /> Volumen</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(parseInt(e.target.value, 10) / 100)}
            className="w-32 accent-brand"
          />
        </div>
      </div>
    </div>
  );
};
