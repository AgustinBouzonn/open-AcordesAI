import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { SearchPage } from './components/SearchPage';
import { Favorites } from './components/Favorites';
import { History } from './components/History';
import { SongDetail } from './components/SongDetail';
import { Song, SongSearchResult, Instrument } from './types';
import { searchSongs, getSongData } from './services/geminiService';
import { cacheSong, getCachedSong, addToHistory, updateSongInstrument } from './services/storageService';

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
  const handleSearch = async (e: React.FormEvent, queryOverride?: string) => {
    e.preventDefault();
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Switch to search view if not already
    navigate('/search');
    
    const results = await searchSongs(query);
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
        return;
    }

    setLoadingInstrument(true);
    try {
        // Fetch new data specifically for this instrument
        const newData = await getSongData(currentSong.id, currentSong.title, currentSong.artist, instrument);
        
        // Update local state
        const updatedSong = {
            ...currentSong,
            chords: {
                ...currentSong.chords,
                [instrument]: newData.content
            }
        };
        
        setCurrentSong(updatedSong);
        
        // Update Cache
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
            isSearching={isSearching}
            searchResults={searchResults}
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
            isLoadingSong={isLoadingSong}
            currentSong={currentSong}
            handleInstrumentChange={handleInstrumentChange}
            loadingInstrument={loadingInstrument}
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
