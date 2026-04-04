import React, { useState, useEffect } from 'react';
import { X, User, Music, Heart, Clock, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../services/apiClient';
import { ProfileStats } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: Props) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({ songsCreated: 0, favorites: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadStats();
    }
  }, [isOpen, user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      setStats(await api.auth.stats());
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeStyle}><X size={20} /></button>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user?.username}</h2>
          <p style={{ color: '#9ca3af' }}>{user?.email}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-brand" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-dark-800 p-4 rounded-xl text-center">
              <Music size={24} className="text-brand mx-auto mb-2" />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.songsCreated}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Canciones</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl text-center">
              <Heart size={24} className="text-brand mx-auto mb-2" />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.favorites}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Favoritos</p>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl text-center">
              <Clock size={24} className="text-brand mx-auto mb-2" />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.views}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Vistas</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#1e1e1e', padding: '1.5rem', borderRadius: '0.75rem', width: '100%', maxWidth: '400px', position: 'relative',
};

const closeStyle: React.CSSProperties = {
  position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
};
