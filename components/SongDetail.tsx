import React from 'react';
import { Loader2 } from 'lucide-react';
import { SongViewer } from './SongViewer';
import { Song, Instrument } from '../types';

interface SongDetailProps {
  currentSong: Song | null;
  isLoadingSong: boolean;
  loadingInstrument: boolean;
  onInstrumentChange: (instrument: Instrument) => Promise<void>;
}

export const SongDetail: React.FC<SongDetailProps> = ({
  currentSong,
  isLoadingSong,
  loadingInstrument,
  onInstrumentChange
}) => {
  if (isLoadingSong) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brand">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-white font-medium animate-pulse">La IA está extrayendo los acordes...</p>
      </div>
    );
  }
  if (!currentSong) return <div>Error loading song.</div>;
  return (
      <SongViewer
          song={currentSong}
          onInstrumentChange={onInstrumentChange}
          isLoadingInstrument={loadingInstrument}
      />
  );
};
