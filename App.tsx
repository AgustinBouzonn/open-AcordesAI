import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from './components/Layout';
import { SongViewer } from './components/SongViewer';
import { AuthModal } from './components/AuthModal';
import { CreateSongModal } from './components/CreateSongModal';
import { AddFromCommunityModal } from './components/AddFromCommunityModal';
import { ImportUrlModal } from './components/ImportUrlModal';
import { ProfileModal } from './components/ProfileModal';
import { useAuth } from './components/AuthContext';
import { useToast } from './components/Toast';
import { Tuner } from './components/Tuner';
import { Metronome } from './components/Metronome';
import { HomePage } from './components/pages/HomePage';
import { SearchPage } from './components/pages/SearchPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { CommunityPage } from './components/pages/CommunityPage';
import { Song, SearchResult } from './types';
import * as storage from './services/storageService';
import { Plus, Globe, Download } from 'lucide-react';

function SongDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    storage.getSong(id)
      .then(setSong)
      .catch(() => setError('Canción no encontrada'))
      .finally(() => setLoading(false));
    storage.addToHistory(id).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brand">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-white font-medium animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <p>{error || 'Canción no encontrada'}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand">Volver al inicio</button>
      </div>
    );
  }

  return <SongViewer song={song} onSongUpdated={setSong} />;
}

function AuthCallbackRoute() {
  const navigate = useNavigate();
  const { completeOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const questionIndex = hash.indexOf('?');
    const params = new URLSearchParams(questionIndex !== -1 ? hash.substring(questionIndex + 1) : '');
    const token = params.get('token');
    const oauthError = params.get('error');

    if (oauthError) { setError(oauthError); return; }
    if (!token) { setError('No se recibió el token de autenticación social'); return; }

    completeOAuth(token)
      .then(() => navigate('/'))
      .catch(() => setError('No se pudo completar el inicio de sesión social'));
  }, [completeOAuth, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      {error ? (
        <>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="text-brand">Volver al inicio</button>
        </>
      ) : (
        <>
          <Loader2 size={40} className="animate-spin text-brand mb-4" />
          <p className="text-white">Completando autenticación...</p>
        </>
      )}
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [communitySongs, setCommunitySongs] = useState<Song[]>([]);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [communityPage, setCommunityPage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFromCommunityModal, setShowAddFromCommunityModal] = useState(false);
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  const [sharedImportUrl, setSharedImportUrl] = useState<string | undefined>(undefined);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const activeTab = location.pathname === '/' ? 'HOME' :
    location.pathname === '/search' ? 'SEARCH' :
    location.pathname === '/favorites' ? 'FAVORITES' :
    location.pathname === '/history' ? 'HISTORY' :
    location.pathname === '/community' ? 'COMMUNITY' :
    location.pathname === '/tuner' ? 'TUNER' :
    location.pathname === '/metronome' ? 'METRONOME' :
    location.pathname.startsWith('/song/') ? 'SONG_DETAIL' : 'HOME';

  useEffect(() => {
    if (user) {
      storage.getFavorites().then(setFavorites).catch(() => {});
      storage.getHistory().then(setHistory).catch(() => {});
    } else {
      setFavorites([]);
      setHistory([]);
    }
  }, [user]);

  useEffect(() => {
    const w = window as unknown as { __acordesaiSharedUrl?: string };
    const openWith = (url: string) => {
      if (!url) return;
      setSharedImportUrl(url);
      setShowImportUrlModal(true);
    };
    if (w.__acordesaiSharedUrl) {
      openWith(w.__acordesaiSharedUrl);
      w.__acordesaiSharedUrl = undefined;
    }
    const onShared = (e: Event) => openWith((e as CustomEvent<string>).detail);
    window.addEventListener('acordesai-shared-url', onShared);
    return () => window.removeEventListener('acordesai-shared-url', onShared);
  }, []);

  useEffect(() => {
    if (activeTab === 'HOME') {
      storage.getPopularSongs(10).then(setPopularSongs).catch(() => setPopularSongs([]));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'COMMUNITY') {
      setLoadingCommunity(true);
      storage.getCommunitySongs(20, communityPage * 20)
        .then(setCommunitySongs)
        .catch(() => setCommunitySongs([]))
        .finally(() => setLoadingCommunity(false));
    }
  }, [activeTab, communityPage]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setSearchQuery(q);
    setIsSearching(true);
    navigate('/search');
    try {
      const [itunesResults, localResults] = await Promise.all([
        storage.searchSongs(q).catch(() => []),
        storage.searchLocalSongs(q).catch(() => []),
      ]);
      const all = [
        ...localResults.map((r) => ({ ...r, source: 'comunidad' as const, id: `local-${r.id}` })),
        ...itunesResults.map((r) => ({ ...r, source: 'itunes' as const, id: r.id })),
      ];
      setSearchResults(all.map((r) => ({ title: r.title, artist: r.artist, source: r.source, url: r.sourceUrl, id: r.id })));
    } catch {
      showToast('Error en la búsqueda', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSearchResultClick = async (result: SearchResult) => {
    if (!user) { openAuth('login'); return; }
    try {
      const song = await storage.createSong({ title: result.title, artist: result.artist, lyrics: '' });
      navigate(`/song/${song.id}`);
    } catch {
      showToast('Error al crear canción', 'error');
    }
  };

  const ensureUserOrLogin = (action: () => void) => {
    if (!user) { openAuth('login'); return; }
    action();
  };

  const handleNav = (tab: string) => {
    const map: Record<string, string> = {
      HOME: '/', SEARCH: '/search', FAVORITES: '/favorites', HISTORY: '/history',
      COMMUNITY: '/community', TUNER: '/tuner', METRONOME: '/metronome',
    };
    if (map[tab]) navigate(map[tab]);
  };

  return (
    <>
      {user && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          <button onClick={() => setShowImportUrlModal(true)} className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg" title="Importar desde URL de Cifra Club">
            <Download size={20} />
          </button>
          <button onClick={() => setShowAddFromCommunityModal(true)} className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg" title="Buscar en iTunes">
            <Globe size={20} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="bg-brand hover:bg-brand/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110" title="Crear canción">
            <Plus size={24} />
          </button>
        </div>
      )}
      <Layout
        activeTab={activeTab}
        onNavigate={handleNav}
        user={user}
        onLoginClick={() => openAuth('login')}
        onRegisterClick={() => openAuth('register')}
        onProfileClick={() => setShowProfileModal(true)}
      >
        <Routes>
          <Route path="/" element={
            <HomePage
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              performSearch={performSearch}
              popularSongs={popularSongs}
              onSelectSong={(id) => navigate(`/song/${id}`)}
            />
          } />
          <Route path="/search" element={
            <SearchPage
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearching}
              searchResults={searchResults}
              hasUser={!!user}
              onResultClick={handleSearchResultClick}
              onCreateClick={() => ensureUserOrLogin(() => setShowCreateModal(true))}
            />
          } />
          <Route path="/favorites" element={
            <FavoritesPage
              favorites={favorites}
              user={user}
              onSelectSong={(id) => navigate(`/song/${id}`)}
              onLogin={() => openAuth('login')}
            />
          } />
          <Route path="/history" element={
            <HistoryPage history={history} onSelectSong={(id) => navigate(`/song/${id}`)} />
          } />
          <Route path="/community" element={
            <CommunityPage
              songs={communitySongs}
              loading={loadingCommunity}
              page={communityPage}
              onPageChange={setCommunityPage}
              onSelectSong={(id) => navigate(`/song/${id}`)}
              onNewClick={() => ensureUserOrLogin(() => setShowCreateModal(true))}
              onSearchClick={() => navigate('/search')}
            />
          } />
          <Route path="/song/:id" element={<SongDetailRoute />} />
          <Route path="/auth/callback" element={<AuthCallbackRoute />} />
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/metronome" element={<Metronome />} />
        </Routes>
      </Layout>
      <AuthModal isOpen={showAuthModal} mode={authMode} onClose={() => setShowAuthModal(false)} />
      <CreateSongModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => { const song = await storage.createSong(data); navigate(`/song/${song.id}`); }}
      />
      <AddFromCommunityModal
        isOpen={showAddFromCommunityModal}
        onClose={() => setShowAddFromCommunityModal(false)}
        onSelect={async (data) => { const song = await storage.createSong(data); navigate(`/song/${song.id}`); }}
      />
      <ImportUrlModal
        isOpen={showImportUrlModal}
        initialUrl={sharedImportUrl}
        onClose={() => { setShowImportUrlModal(false); setSharedImportUrl(undefined); }}
        onImported={(song) => navigate(`/song/${song.id}`)}
      />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}

export default function App() {
  return <HashRouter><AppContent /></HashRouter>;
}
