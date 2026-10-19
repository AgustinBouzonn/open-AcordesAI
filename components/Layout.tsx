import React from 'react';
import { Home, Search, Heart, Music2, Clock, LogIn, UserPlus, Users, User, AudioWaveform, Music, ListMusic, Activity } from 'lucide-react';
import { useAuth } from './AuthContext';
import { InstallAppButton } from './InstallAppButton';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  user?: { username: string; email: string } | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onProfileClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, user, onLoginClick, onRegisterClick, onProfileClick }) => {
  useAuth();

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col pb-20 lg:pb-0">
      <header className="sticky top-0 z-50 bg-dark-800 border-b border-dark-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          <button type="button" className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME')} aria-label="AcordesAI, ir al inicio">
            <span className="bg-brand p-1.5 rounded-lg" aria-hidden="true">
              <Music2 size={24} className="text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight">Acordes<span className="text-brand">AI</span></span>
          </button>

          <nav aria-label="Principal" className="hidden lg:flex items-center gap-4">
            <button onClick={() => onNavigate('HOME')} aria-current={activeTab === 'HOME' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'HOME' ? 'text-brand' : 'text-gray-400'}`}>
              Inicio
            </button>
            <button onClick={() => onNavigate('SEARCH')} aria-current={activeTab === 'SEARCH' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'SEARCH' ? 'text-brand' : 'text-gray-400'}`}>
              Buscar
            </button>
            <button onClick={() => onNavigate('FAVORITES')} aria-current={activeTab === 'FAVORITES' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'FAVORITES' ? 'text-brand' : 'text-gray-400'}`}>
              Favoritos
            </button>
            <button onClick={() => onNavigate('HISTORY')} aria-current={activeTab === 'HISTORY' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'HISTORY' ? 'text-brand' : 'text-gray-400'}`}>
              Historial
            </button>
            <button onClick={() => onNavigate('COMMUNITY')} aria-current={activeTab === 'COMMUNITY' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'COMMUNITY' ? 'text-brand' : 'text-gray-400'}`}>
              Comunidad
            </button>
            <button onClick={() => onNavigate('TUNER')} aria-current={activeTab === 'TUNER' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'TUNER' ? 'text-brand' : 'text-gray-400'}`}>
              Afinador
            </button>
            <button onClick={() => onNavigate('METRONOME')} aria-current={activeTab === 'METRONOME' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'METRONOME' ? 'text-brand' : 'text-gray-400'}`}>
              Metrónomo
            </button>
            <button onClick={() => onNavigate('SETLISTS')} aria-current={activeTab === 'SETLISTS' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'SETLISTS' ? 'text-brand' : 'text-gray-400'}`}>
              Setlists
            </button>
            {user && (
              <button onClick={() => onNavigate('STATS')} aria-current={activeTab === 'STATS' ? 'page' : undefined} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'STATS' ? 'text-brand' : 'text-gray-400'}`}>
                Stats
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <InstallAppButton />
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={onProfileClick}
                  aria-label={`Perfil de ${user.username}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
                >
                  <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:block">{user.username}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onLoginClick} aria-label="Entrar" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm text-gray-300 hover:text-white transition">
                  <LogIn size={16} /> <span className="hidden sm:inline">Entrar</span>
                </button>
                <button onClick={onRegisterClick} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-strong hover:bg-brand-strong/90 text-sm text-white transition">
                  <UserPlus size={16} /> Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <nav aria-label="Navegación inferior" className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => onNavigate('HOME')} aria-current={activeTab === 'HOME' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'HOME' ? 'text-brand' : 'text-gray-400'}`}>
            <Home size={20} /><span className="text-[10px]">Inicio</span>
          </button>
          <button onClick={() => onNavigate('SEARCH')} aria-current={activeTab === 'SEARCH' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'SEARCH' ? 'text-brand' : 'text-gray-400'}`}>
            <Search size={20} /><span className="text-[10px]">Buscar</span>
          </button>
          <button onClick={() => onNavigate('FAVORITES')} aria-current={activeTab === 'FAVORITES' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'FAVORITES' ? 'text-brand' : 'text-gray-400'}`}>
            <Heart size={20} /><span className="text-[10px]">Favoritos</span>
          </button>
          <button onClick={() => onNavigate('HISTORY')} aria-current={activeTab === 'HISTORY' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'HISTORY' ? 'text-brand' : 'text-gray-400'}`}>
            <Clock size={20} /><span className="text-[10px]">Historial</span>
          </button>
          <button onClick={() => onNavigate('COMMUNITY')} aria-current={activeTab === 'COMMUNITY' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'COMMUNITY' ? 'text-brand' : 'text-gray-400'}`}>
            <Users size={20} /><span className="text-[10px]">Comunidad</span>
          </button>
          <button onClick={() => onNavigate('TUNER')} aria-current={activeTab === 'TUNER' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'TUNER' ? 'text-brand' : 'text-gray-400'}`}>
            <AudioWaveform size={20} /><span className="text-[10px]">Afinador</span>
          </button>
          <button onClick={() => onNavigate('METRONOME')} aria-current={activeTab === 'METRONOME' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'METRONOME' ? 'text-brand' : 'text-gray-400'}`}>
            <Music size={20} /><span className="text-[10px]">Metro</span>
          </button>
          <button onClick={() => onNavigate('SETLISTS')} aria-current={activeTab === 'SETLISTS' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'SETLISTS' ? 'text-brand' : 'text-gray-400'}`}>
            <ListMusic size={20} /><span className="text-[10px]">Setlists</span>
          </button>
          {user && (
            <button onClick={() => onNavigate('STATS')} aria-current={activeTab === 'STATS' ? 'page' : undefined} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'STATS' ? 'text-brand' : 'text-gray-400'}`}>
              <Activity size={20} /><span className="text-[10px]">Stats</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
