import React from 'react';
import { Home, Search, Heart, Music2, Clock, LogIn, UserPlus, LogOut, Users } from 'lucide-react';
import { useAuth } from './AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  user?: { username: string; email: string } | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, user, onLoginClick, onRegisterClick }) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-dark-800 border-b border-dark-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME')}>
            <div className="bg-brand p-1.5 rounded-lg">
              <Music2 size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Acordes<span className="text-brand">AI</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => onNavigate('HOME')} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'HOME' ? 'text-brand' : 'text-gray-400'}`}>
              Inicio
            </button>
            <button onClick={() => onNavigate('SEARCH')} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'SEARCH' ? 'text-brand' : 'text-gray-400'}`}>
              Buscar
            </button>
            <button onClick={() => onNavigate('FAVORITES')} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'FAVORITES' ? 'text-brand' : 'text-gray-400'}`}>
              Favoritos
            </button>
            <button onClick={() => onNavigate('HISTORY')} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'HISTORY' ? 'text-brand' : 'text-gray-400'}`}>
              Historial
            </button>
            <button onClick={() => onNavigate('COMMUNITY')} className={`text-sm font-medium hover:text-brand transition ${activeTab === 'COMMUNITY' ? 'text-brand' : 'text-gray-400'}`}>
              Comunidad
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 hidden sm:block">{user.username}</span>
                <button onClick={logout} className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition" title="Cerrar sesión">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onLoginClick} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm text-gray-300 hover:text-white transition">
                  <LogIn size={16} /> <span className="hidden sm:inline">Entrar</span>
                </button>
                <button onClick={onRegisterClick} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-sm text-white transition">
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

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => onNavigate('HOME')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'HOME' ? 'text-brand' : 'text-gray-500'}`}>
            <Home size={20} /><span className="text-[10px]">Inicio</span>
          </button>
          <button onClick={() => onNavigate('SEARCH')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'SEARCH' ? 'text-brand' : 'text-gray-500'}`}>
            <Search size={20} /><span className="text-[10px]">Buscar</span>
          </button>
          <button onClick={() => onNavigate('FAVORITES')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'FAVORITES' ? 'text-brand' : 'text-gray-500'}`}>
            <Heart size={20} /><span className="text-[10px]">Favoritos</span>
          </button>
          <button onClick={() => onNavigate('HISTORY')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'HISTORY' ? 'text-brand' : 'text-gray-500'}`}>
            <Clock size={20} /><span className="text-[10px]">Historial</span>
          </button>
          <button onClick={() => onNavigate('COMMUNITY')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'COMMUNITY' ? 'text-brand' : 'text-gray-500'}`}>
            <Users size={20} /><span className="text-[10px]">Comunidad</span>
          </button>
        </div>
      </div>
    </div>
  );
};
