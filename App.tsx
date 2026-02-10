import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SongViewer } from './components/SongViewer';
import { Home } from './components/Home';
import { SearchPage } from './components/SearchPage';
import { Favorites } from './components/Favorites';
import { History } from './components/History';
import { Song, SongSearchResult, Instrument } from './types';
import { searchSongs, getSongData } from './services/geminiService';
import { cacheSong, getCachedSong, addToHistory, updateSongInstrument } from './services/storageService';
import { Loader2 } from 'lucide-react';

const SongDetail = ({
  isLoading,
  song,
  onInstrumentChange,
  isLoadingInstrument
}: {
  isLoading: boolean;
  song: Song | null;
  onInstrumentChange: (i: Instrument) => Promise<void>;
  isLoadingInstrument: boolean
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
          isLoadingInstrument={isLoadingInstrument}
      />
  );
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('HOME');
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [loadingInstrument, setLoadingInstrument] = useState(false);

  // Sync tab with route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('HOME');
    else if (path === '/search') setActiveTab('SEARCH');
    else if (path === '/favorites') setActiveTab('FAVORITES');
    else if (path === '/history') setActiveTab('HISTORY');
    else if (path.startsWith('/song/')) setActiveTab('SONG_DETAIL');
  }, [location]);

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Switch to search view if not already
    navigate('/search');
    
    const results = await searchSongs(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Handle Song Selection
  const loadSong = async (id: string, title?: string, artist?: string) => {
    setIsLoadingSong(true);
    
    // Check cache first
    const cached = getCachedSong(id);
    if (cached) {
      setCurrentSong(cached);
      addToHistory(cached.id); // Add to history
      setIsLoadingSong(false);
      navigate(`/song/${id}`);
      return;
    }

    try {
      // Default to guitar when loading fresh
      const songData = await getSongData(id, title, artist, 'guitar');
      cacheSong(songData);
      addToHistory(songData.id); // Add to history
      setCurrentSong(songData);
      navigate(`/song/${id}`);
    } catch (err) {
      alert("Error al cargar la canción.");
    } finally {
      setIsLoadingSong(false);
    }
  };

  // Handle Instrument Switch
  const handleInstrumentChange = async (instrument: Instrument) => {
    if (!currentSong) return;

    // Check if we already have the chords for this instrument
    if (currentSong.chords && currentSong.chords[instrument]) {
        // Just update the main content view locally if needed, but the viewer handles the 'chords' map.
        // We really just need to return here.
        return;
    }

    setLoadingInstrument(true);
    try {
        // Fetch new data specifically for this instrument
        // We reuse getSongData but merge the result
        const newData = await getSongData(currentSong.id, currentSong.title, currentSong.artist, instrument);
        
        // Update local state
        const updatedSong = {
            ...currentSong,
            chords: {
                ...currentSong.chords,
                [instrument]: newData.content // The new content is in the .content of the response or .chords[instrument]
            }
        };
        
        setCurrentSong(updatedSong);
        
        // Update Cache
        // We use the specific update helper to ensure we persist just this new piece without data loss
        updateSongInstrument(currentSong.id, instrument, newData.content);
        
    } catch (e) {
        console.error("Failed to switch instrument", e);
    } finally {
        setLoadingInstrument(false);
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={(tab) => {
        if (tab === 'HOME') navigate('/');
        if (tab === 'SEARCH') navigate('/search');
        if (tab === 'FAVORITES') navigate('/favorites');
        if (tab === 'HISTORY') navigate('/history');
    }}>
      {/*
        ⚡ Bolt Performance Optimization:
        Routes now use stable component instances instead of inline render functions.
        This prevents unnecessary re-creation of component trees on every AppContent render
        and avoids executing route logic (like reading from localStorage) when the route is not active.
      */}
      <Routes>
        <Route path="/" element={
          <Home
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        } />
        <Route path="/search" element={
          <SearchPage
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            loadSong={loadSong}
          />
        } />
        <Route path="/favorites" element={
          <Favorites loadSong={loadSong} />
        } />
        <Route path="/history" element={
          <History loadSong={loadSong} />
        } />
        <Route path="/song/:id" element={
          <SongDetail
            isLoading={isLoadingSong}
            song={currentSong}
            onInstrumentChange={handleInstrumentChange}
            isLoadingInstrument={loadingInstrument}
          />
        } />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
