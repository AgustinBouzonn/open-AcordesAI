import React from 'react';
import { Loader2 } from 'lucide-react';
import { Song, Instrument } from '../types';
import { SongViewer } from './SongViewer';

interface SongDetailProps {
  song: Song | null;
  isLoading: boolean;
  loadingInstrument: boolean;
  onInstrumentChange: (instrument: Instrument) => void;
}

export const SongDetail: React.FC<SongDetailProps> = ({
  song,
  isLoading,
  loadingInstrument,
  onInstrumentChange
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brand">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-white font-medium animate-pulse">La IA está extrayendo los acordes...</p>
      </div>
    );
  }
  if (!song) return <div>Error loading song.</div>;
  return (
      <SongViewer
          song={song}
          onInstrumentChange={onInstrumentChange}
          isLoadingInstrument={loadingInstrument}
      />
  );
};
