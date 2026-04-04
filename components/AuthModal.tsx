import React, { useState } from 'react';
import { Github, Chrome } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, mode }: Props) {
  const { login, register, loginWithOAuth } = useAuth();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (currentMode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      onClose();
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>{currentMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit}>
          {currentMode === 'register' && (
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? '...' : currentMode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>
        <div style={dividerStyle}>o continúa con</div>
        <div style={oauthButtonsStyle}>
          <button type="button" onClick={() => loginWithOAuth('google')} style={oauthButtonStyle}>
            <Chrome size={18} /> Google
          </button>
          <button type="button" onClick={() => loginWithOAuth('github')} style={oauthButtonStyle}>
            <Github size={18} /> GitHub
          </button>
        </div>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          {currentMode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => setCurrentMode(currentMode === 'login' ? 'register' : 'login')}
            style={linkStyle}
          >
            {currentMode === 'login' ? 'Regístrate' : 'Entra'}
          </button>
        </p>
        <button onClick={onClose} style={closeStyle}>✕</button>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#1e1e1e',
  padding: '2rem',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '400px',
  position: 'relative',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '4px',
  border: '1px solid #333',
  background: '#2a2a2a',
  color: '#fff',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = { color: '#ef4444', marginBottom: '1rem' };

const dividerStyle: React.CSSProperties = {
  marginTop: '1rem',
  marginBottom: '0.75rem',
  color: '#9ca3af',
  textAlign: 'center',
  fontSize: '0.875rem',
};

const oauthButtonsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
};

const oauthButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.75rem',
  background: '#2a2a2a',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: '4px',
  cursor: 'pointer',
};

const linkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#4f46e5',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const closeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '1.2rem',
};
