import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Loader2, Plus, Globe, Download } from 'lucide-react';
import { Layout } from './components/Layout';
import { AuthModal } from './components/AuthModal';
import { CreateSongModal } from './components/CreateSongModal';
import { AddFromCommunityModal } from './components/AddFromCommunityModal';
import { ProfileModal } from './components/ProfileModal';
import { useAuth } from './components/AuthContext';
import { useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingModal } from './components/OnboardingModal';
import { HomePage } from './components/pages/HomePage';
import { SearchPage } from './components/pages/SearchPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { Song, SearchResult } from './types';
import * as storage from './services/storageService';

const SongViewer = lazy(() => import('./components/SongViewer').then((m) => ({ default: m.SongViewer })));
const ImportUrlModal = lazy(() => import('./components/ImportUrlModal').then((m) => ({ default: m.ImportUrlModal })));
const Tuner = lazy(() => import('./components/Tuner').then((m) => ({ default: m.Tuner })));
const Metronome = lazy(() => import('./components/Metronome').then((m) => ({ default: m.Metronome })));
const CommunityPage = lazy(() => import('./components/pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const SetlistsPage = lazy(() => import('./components/pages/SetlistsPage').then((m) => ({ default: m.SetlistsPage })));
const ChordSearchPage = lazy(() => import('./components/pages/ChordSearchPage').then((m) => ({ default: m.ChordSearchPage })));
const PublicSetlistPage = lazy(() => import('./components/pages/PublicSetlistPage').then((m) => ({ default: m.PublicSetlistPage })));
const LearningPage = lazy(() => import('./components/pages/LearningPage').then((m) => ({ default: m.LearningPage })));
const StatsPage = lazy(() => import('./components/pages/StatsPage').then((m) => ({ default: m.StatsPage })));

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] text-brand" role="status" aria-live="polite">
    <Loader2 size={40} className="animate-spin mb-3" />
    <span className="sr-only">Cargando…</span>
  </div>
);

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

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <SongViewer song={song} onSongUpdated={setSong} />
      </Suspense>
    </ErrorBoundary>
  );
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
    location.pathname === '/setlists' ? 'SETLISTS' :
    location.pathname === '/stats' ? 'STATS' :
    location.pathname.startsWith('/song/') ? 'SONG_DETAIL' : 'HOME';

  useEffect(() => {
    if (user) {
      storage.getFavorites().then(setFavorites).catch(() => showToast('No se pudieron cargar favoritos', 'error'));
      storage.getHistory().then(setHistory).catch(() => showToast('No se pudo cargar el historial', 'error'));
    } else {
      setFavorites([]);
      setHistory([]);
    }
  }, [user, showToast]);

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

    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    if (sharedUrl && /^https?:\/\//i.test(sharedUrl)) {
      openWith(sharedUrl);
      const cleanedUrl = window.location.pathname + (window.location.hash || '');
      window.history.replaceState({}, '', cleanedUrl);
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

  const performSearch = useCallback(async (q: string) => {
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
  }, [navigate, showToast]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  }, [performSearch, searchQuery]);

  const openAuth = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  }, []);

  const handleSearchResultClick = useCallback(async (result: SearchResult) => {
    if (!user) { openAuth('login'); return; }
    try {
      const song = await storage.createSong({ title: result.title, artist: result.artist, lyrics: '' });
      navigate(`/song/${song.id}`);
    } catch {
      showToast('Error al crear canción', 'error');
    }
  }, [user, navigate, showToast, openAuth]);

  const ensureUserOrLogin = useCallback((action: () => void) => {
    if (!user) { openAuth('login'); return; }
    action();
  }, [user, openAuth]);

  const handleNav = useCallback((tab: string) => {
    const map: Record<string, string> = {
      HOME: '/', SEARCH: '/search', FAVORITES: '/favorites', HISTORY: '/history',
      COMMUNITY: '/community', TUNER: '/tuner', METRONOME: '/metronome', SETLISTS: '/setlists',
      STATS: '/stats',
    };
    if (map[tab]) navigate(map[tab]);
  }, [navigate]);

  return (
    <>
      {user && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          <button
            onClick={() => setShowImportUrlModal(true)}
            className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Importar desde URL de Cifra Club"
            aria-label="Importar desde URL"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setShowAddFromCommunityModal(true)}
            className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Buscar en iTunes"
            aria-label="Buscar en iTunes"
          >
            <Globe size={20} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand hover:bg-brand/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 min-w-[56px] min-h-[56px] flex items-center justify-center"
            title="Crear canción"
            aria-label="Crear canción"
          >
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
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={
                <HomePage
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onSearch={handleSearch}
                  performSearch={performSearch}
                  popularSongs={popularSongs}
                  onSelectSong={(id) => navigate(`/song/${id}`)}
                  hasUser={!!user}
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
              <Route path="/setlists" element={
                <SetlistsPage user={user} onLogin={() => openAuth('login')} onSelectSong={(id) => navigate(`/song/${id}`)} />
              } />
              <Route path="/chord-search" element={
                <ChordSearchPage onSelectSong={(id) => navigate(`/song/${id}`)} />
              } />
              <Route path="/shared/setlist/:token" element={<PublicSetlistPage />} />
              <Route path="/learning" element={
                <LearningPage user={user} onLogin={() => openAuth('login')} onSelectSong={(id) => navigate(`/song/${id}`)} />
              } />
              <Route path="/stats" element={
                <StatsPage user={user} onLogin={() => openAuth('login')} onSelectSong={(id) => navigate(`/song/${id}`)} />
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>
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
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <Suspense fallback={null}>
        {showImportUrlModal && (
          <ImportUrlModal
            isOpen={showImportUrlModal}
            initialUrl={sharedImportUrl}
            onClose={() => { setShowImportUrlModal(false); setSharedImportUrl(undefined); }}
            onImported={(song) => navigate(`/song/${song.id}`)}
          />
        )}
      </Suspense>
      <OnboardingModal />
    </>
  );
}

export default function App() {
  return <HashRouter><AppContent /></HashRouter>;
}
