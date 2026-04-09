import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SongViewer } from './components/SongViewer';
import { AuthModal } from './components/AuthModal';
import { CreateSongModal } from './components/CreateSongModal';
import { AddFromCommunityModal } from './components/AddFromCommunityModal';
import { ProfileModal } from './components/ProfileModal';
import { useAuth } from './components/AuthContext';
import { Song, SearchResult } from './types';
import * as storage from './services/storageService';
import { Search, Loader2, Music, TrendingUp, ChevronRight, Clock, Heart, LogIn, UserPlus, Users, Star, Plus, Globe } from 'lucide-react';

const TRENDING_SEARCHES = [
  "Lamento Boliviano - Enanitos Verdes",
  "De Música Ligera - Soda Stereo",
  "La Flaca - Jarabe de Palo",
  "Wonderwall - Oasis",
  "Creep - Radiohead"
];

const Artwork: React.FC<{ url?: string; size?: number; className?: string }> = ({ url, size = 48, className = '' }) => {
  if (url) {
    return (
      <img src={url} alt="" width={size} height={size} className={`rounded-lg object-cover shrink-0 ${className}`} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    );
  }
  return (
    <div style={{ width: size, height: size }} className={`bg-dark-900 rounded-lg flex items-center justify-center shrink-0 border border-dark-700 ${className}`}>
      <Music size={size * 0.45} className="text-brand" />
    </div>
  );
};

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

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!token) {
      setError('No se recibió el token de autenticación social');
      return;
    }

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
  const { user, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [communitySongs, setCommunitySongs] = useState<Song[]>([]);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [communityPage, setCommunityPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFromCommunityModal, setShowAddFromCommunityModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const activeTab = location.pathname === '/' ? 'HOME' :
    location.pathname === '/search' ? 'SEARCH' :
    location.pathname === '/favorites' ? 'FAVORITES' :
    location.pathname === '/history' ? 'HISTORY' :
    location.pathname === '/community' ? 'COMMUNITY' :
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
    if (activeTab === 'HOME') {
      setLoadingPopular(true);
      storage.getPopularSongs(10)
        .then(setPopularSongs)
        .catch(() => setPopularSongs([]))
        .finally(() => setLoadingPopular(false));
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

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsSearching(true);
    navigate('/search');
    try {
      const [itunesResults, localResults] = await Promise.all([
        storage.searchSongs(query).catch(() => []),
        storage.searchLocalSongs(query).catch(() => [])
      ]);
      // ⚡ Bolt: Optimize search processing to avoid intermediate array allocations.
      // Replacing chained map/spread operators with a single-pass loop reduces GC pauses in hot paths.
      const formattedResults: SearchResult[] = [];
      for (const result of localResults) {
        formattedResults.push({ title: result.title, artist: result.artist, source: 'comunidad', url: result.sourceUrl, id: `local-${result.id}` });
      }
      for (const result of itunesResults) {
        formattedResults.push({ title: result.title, artist: result.artist, source: 'itunes', url: result.sourceUrl, id: result.id });
      }
      setSearchResults(formattedResults);
    } catch {
      setErrorMessage('Error en la búsqueda');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleToggleFavorite = async (songId: string) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    await storage.toggleFavorite(songId);
    const newFavs = await storage.getFavorites();
    setFavorites(newFavs);
  };

  const handleCreateSong = async (data: { title: string; artist: string; lyrics?: string }) => {
    const song = await storage.createSong(data);
    navigate(`/song/${song.id}`);
  };

  const handleAddFromCommunity = async (data: { title: string; artist: string }) => {
    const song = await storage.createSong(data);
    navigate(`/song/${song.id}`);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const renderHome = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand to-yellow-500">
          Toca lo que quieras.
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Busca cualquier canción y obtén los acordes al instante con IA.
        </p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Canción o artista..."
            className="w-full bg-dark-800 border border-dark-600 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition shadow-lg"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          <button type="submit" className="hidden">Buscar</button>
        </form>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs">
          <TrendingUp size={16} />
          <span>Tendencias</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRENDING_SEARCHES.map((term, idx) => (
            <div key={idx} onClick={() => performSearch(term)} className="group bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl p-4 cursor-pointer transition flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-dark-900 p-2 rounded-lg text-brand group-hover:scale-110 transition"><Music size={20} /></div>
                <span className="font-medium text-sm text-gray-200">{term}</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition" />
            </div>
          ))}
        </div>
      </div>

      {popularSongs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs">
            <Star size={16} />
            <span>Más Populares</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularSongs.slice(0, 6).map((song) => (
              <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
                <div className="flex items-center gap-4">
                  <Artwork size={52} url={song.artworkUrl} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {song.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs">{song.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(song.hasChords || 0) > 0 && (
                    <span className="bg-brand/20 text-brand text-xs px-2 py-1 rounded">Con cifrado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6">
      <div className="sticky top-0 bg-dark-900 z-10 py-2">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand"
            autoFocus
          />
          <Search className="absolute left-3 top-3.5 text-gray-500" size={20} />
          {isSearching && <div className="absolute right-3 top-3.5"><Loader2 className="animate-spin text-brand" size={20} /></div>}
        </form>
      </div>
      {searchResults.length > 0 ? (
        <div className="space-y-2">
          {searchResults.map((result, idx) => (
            <div key={idx} onClick={async () => {
              if (!user) {
                setAuthMode('login');
                setShowAuthModal(true);
                return;
              }
              try {
                const song = await storage.createSong({ title: result.title, artist: result.artist, lyrics: '' });
                navigate(`/song/${song.id}`);
              } catch (e) {
                setErrorMessage('Error al crear canción');
              }
            }} className="bg-dark-800 hover:bg-dark-700 p-3 rounded-xl cursor-pointer border border-transparent hover:border-brand/30 transition flex items-center gap-3">
              <Artwork size={52} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{result.title}</h3>
                <p className="text-sm text-brand truncate">{result.artist}</p>
              </div>
              <ChevronRight size={16} className="text-gray-500 shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        !isSearching && (
          <div className="text-center text-gray-500 mt-20">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="mb-4">No se encontraron resultados.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => user ? setShowCreateModal(true) : (setAuthMode('login'), setShowAuthModal(true))}
                className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Crear canción manualmente
              </button>
              <button 
                onClick={() => user ? setShowCreateModal(true) : (setAuthMode('login'), setShowAuthModal(true))}
                className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Subir cifrado propio
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Heart className="text-brand fill-current" />Mis Favoritos</h2>
      {favorites.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
          <Heart size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aún no tienes canciones favoritas.</p>
          {!user && (
            <button onClick={() => openAuth('login')} className="mt-4 text-brand font-medium hover:underline flex items-center justify-center gap-2">
              <LogIn size={16} /> Inicia sesión
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((song) => (
            <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="group bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-4">
                <Artwork url={song.artworkUrl} size={52} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Clock className="text-brand" />Historial Reciente</h2>
      {history.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <Clock size={48} className="mx-auto mb-4 opacity-20" />
          <p>Las últimas canciones que veas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((song) => (
            <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="bg-dark-800 hover:bg-dark-700 p-3 rounded-xl cursor-pointer border border-dark-700 hover:border-brand/30 transition flex items-center gap-3">
              <Artwork size={48} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-brand" />Comunidad</h2>
        <button 
          onClick={() => user ? setShowCreateModal(true) : (setAuthMode('login'), setShowAuthModal(true))} 
          className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={18} /> Crear canción
        </button>
      </div>
      {loadingCommunity ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand" size={40} />
        </div>
      ) : communitySongs.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 bg-dark-800 p-8 rounded-xl border border-dashed border-dark-600">
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p>No hay canciones en la comunidad todavía.</p>
          <button onClick={() => navigate('/search')} className="mt-4 text-brand font-medium hover:underline">
            Sé el primero en agregar una
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communitySongs.map((song) => (
            <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand/50 p-4 rounded-xl cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-4">
                <Artwork size={52} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {song.author && (
                      <span className="text-xs text-gray-500">por {song.author}</span>
                    )}
                    {song.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs">{song.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                {(song.hasChords || 0) > 0 && (
                  <span className="bg-brand/20 text-brand text-xs px-2 py-1 rounded">Con cifrado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {communitySongs.length >= 20 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setCommunityPage(p => Math.max(0, p - 1))}
            disabled={communityPage === 0}
            className="px-4 py-2 bg-dark-700 rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="py-2 text-gray-400">Página {communityPage + 1}</span>
          <button
            onClick={() => setCommunityPage(p => p + 1)}
            disabled={communitySongs.length < 20}
            className="px-4 py-2 bg-dark-700 rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );

  const handleNav = (tab: string) => {
    if (tab === 'HOME') navigate('/');
    if (tab === 'SEARCH') navigate('/search');
    if (tab === 'FAVORITES') navigate('/favorites');
    if (tab === 'HISTORY') navigate('/history');
    if (tab === 'COMMUNITY') navigate('/community');
  };

  return (
    <>
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-700 text-red-100 text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-300 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}
      {user && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          <button
            onClick={() => setShowAddFromCommunityModal(true)}
            className="bg-dark-700 hover:bg-dark-600 text-white p-3 rounded-full shadow-lg"
            title="Buscar en iTunes"
          >
            <Globe size={20} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand hover:bg-brand/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
            title="Crear canción"
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
        <Routes>
          <Route path="/" element={renderHome()} />
          <Route path="/search" element={renderSearch()} />
          <Route path="/favorites" element={renderFavorites()} />
          <Route path="/history" element={renderHistory()} />
          <Route path="/community" element={renderCommunity()} />
          <Route path="/song/:id" element={<SongDetailRoute />} />
          <Route path="/auth/callback" element={<AuthCallbackRoute />} />
        </Routes>
      </Layout>
      <AuthModal isOpen={showAuthModal} mode={authMode} onClose={() => setShowAuthModal(false)} />
      <CreateSongModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSubmit={handleCreateSong} 
      />
      <AddFromCommunityModal 
        isOpen={showAddFromCommunityModal} 
        onClose={() => setShowAddFromCommunityModal(false)} 
        onSelect={handleAddFromCommunity}
      />
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}

export default function App() {
  return <HashRouter><AppContent /></HashRouter>;
}
