import React from 'react';
import { Loader2 } from 'lucide-react';
import { SongViewer } from './SongViewer';
import { Song, Instrument } from '../types';

interface SongDetailProps {
  isLoadingSong: boolean;
  currentSong: Song | null;
  handleInstrumentChange: (instrument: Instrument) => Promise<void>;
  loadingInstrument: boolean;
}

export const SongDetail: React.FC<SongDetailProps> = ({
  isLoadingSong,
  currentSong,
  handleInstrumentChange,
  loadingInstrument
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
            onInstrumentChange={handleInstrumentChange}
            isLoadingInstrument={loadingInstrument}
        />
    );
};
