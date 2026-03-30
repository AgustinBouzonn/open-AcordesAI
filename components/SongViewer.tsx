import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, PlayCircle, PauseCircle, Type, Minus, Plus, Loader2, Edit2, Save, X, Copy, Upload, Download, Star } from 'lucide-react';
import { Song, Comment } from '../types';
import { useAuth } from './AuthContext';
import { ImportModal } from './ImportModal';
import { api } from '../services/apiClient';
import * as storage from '../services/storageService';

interface SongViewerProps {
  song: Song;
  onSongUpdated?: (song: Song) => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({ song, onSongUpdated }) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingChords, setLoadingChords] = useState(false);
  const [displayChords, setDisplayChords] = useState(song.chords || '');
  const [editMode, setEditMode] = useState(false);
  const [editedChords, setEditedChords] = useState(song.chords || '');
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState<{ average: string; count: number } | null>(null);
  
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayChords(song.chords || '');
    setEditedChords(song.chords || '');
    loadFavorites();
    loadComments();
    loadRating();
    setAutoScrollSpeed(0);
    setEditMode(false);
  }, [song.id]);

  const loadRating = async () => {
    try {
      const data = await api.request(`/ratings/${song.id}`) as { average: string; count: number };
      setAvgRating(data);
    } catch {}
  };

  const handleRating = async (score: number) => {
    if (!user) return;
    setUserRating(score);
    try {
      await api.request(`/ratings/${song.id}`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      });
      loadRating();
    } catch {}
  };

  useEffect(() => {
    if (autoScrollSpeed > 0) {
      scrollInterval.current = setInterval(() => window.scrollBy(0, 1), 50 / autoScrollSpeed);
    } else {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    }
    return () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };
  }, [autoScrollSpeed]);

  const loadFavorites = async () => {
    if (user) {
      const favs = await storage.getFavorites();
      setIsFav(favs.some(f => f.id === song.id));
    }
  };

  const loadComments = async () => {
    const c = await storage.getComments(song.id);
    setComments(c);
  };

  const handleToggleFav = async () => {
    if (!user) return;
    const newState = await storage.toggleFavorite(song.id);
    setIsFav(newState);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    const added = await storage.addComment(song.id, newComment);
    setComments([added, ...comments]);
    setNewComment('');
  };

  const handleGenerateChords = async () => {
    setLoadingChords(true);
    try {
      const result = await storage.getChords(song.id);
      setDisplayChords(result.chords);
      setEditedChords(result.chords);
      if (onSongUpdated) {
        onSongUpdated({ ...song, chords: result.chords });
      }
    } catch (err) {
      console.error('Failed to generate chords:', err);
    } finally {
      setLoadingChords(false);
    }
  };

  const handleSaveChords = async () => {
    setSaving(true);
    try {
      await storage.saveChords(song.id, editedChords);
      setDisplayChords(editedChords);
      setEditMode(false);
      if (onSongUpdated) {
        onSongUpdated({ ...song, chords: editedChords });
      }
    } catch (err) {
      console.error('Failed to save chords:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedChords(displayChords);
    setEditMode(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setEditedChords(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = (chords: string) => {
    setEditedChords(chords);
    setEditMode(true);
  };

  const handleDownload = () => {
    const blob = new Blob([displayChords], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title} - ${song.artist}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEditedChords(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-dark-700">
        <div className="flex items-center gap-4">
          {song.artworkUrl && (
            <img src={song.artworkUrl} alt={`${song.title}`} className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-lg border border-dark-600" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{song.title}</h1>
            <h2 className="text-brand text-lg font-medium">{song.artist}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} disabled={!user} onClick={() => handleRating(star)} className={`${!user ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition`}>
                    <Star size={16} className={star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-500'} />
                  </button>
                ))}
                {avgRating?.average && (
                  <span className="text-yellow-400 text-sm ml-1">{avgRating.average}</span>
                )}
                {avgRating?.count !== undefined && avgRating.count > 0 && (
                  <span className="text-gray-500 text-xs">({avgRating.count})</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleToggleFav} disabled={!user} className={`p-3 rounded-full transition ${!user ? 'opacity-50 cursor-not-allowed' : isFav ? 'bg-brand text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
            <Heart size={20} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition relative">
            <MessageSquare size={20} />
            {comments.length > 0 && <span className="absolute -top-1 -right-1 bg-brand text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{comments.length}</span>}
          </button>
        </div>
      </div>

      <div className="sticky top-20 md:top-24 z-30 bg-dark-800/95 backdrop-blur-md rounded-xl border border-dark-600 shadow-xl flex flex-col md:flex-row items-center justify-between p-2 gap-3">
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={handleSaveChords} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition">
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm font-medium transition">
                <X size={16} /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} disabled={!user} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${!user ? 'opacity-50 cursor-not-allowed bg-dark-700 text-gray-400' : 'bg-brand hover:bg-brand/90 text-white'}`}>
                <Edit2 size={16} /> {user ? 'Editar' : 'Inicia sesión'}
              </button>
              <button onClick={() => setShowImport(true)} disabled={!user} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${!user ? 'opacity-50 cursor-not-allowed bg-dark-700 text-gray-400' : 'bg-dark-700 hover:bg-dark-600 text-gray-300'}`}>
                <Download size={16} /> Importar
              </button>
              {displayChords && (
                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-dark-700 hover:bg-dark-600 text-gray-300">
                  <Upload size={16} /> Exportar
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 text-gray-400 hover:text-white"><Minus size={16} /></button>
            <Type size={18} className="text-brand" />
            <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-2 text-gray-400 hover:text-white"><Plus size={16} /></button>
          </div>
          
          <div className="w-px h-6 bg-dark-600 hidden md:block"></div>

          <div className="flex items-center gap-1">
            {autoScrollSpeed > 0 && (
              <>
                <button onClick={() => setAutoScrollSpeed(s => Math.max(1, s - 1))} className="p-1 text-gray-400 hover:text-white"><Minus size={13} /></button>
                <span className="text-xs text-brand font-mono w-4 text-center">{autoScrollSpeed}</span>
                <button onClick={() => setAutoScrollSpeed(s => Math.min(5, s + 1))} className="p-1 text-gray-400 hover:text-white"><Plus size={13} /></button>
              </>
            )}
            <button onClick={() => setAutoScrollSpeed(s => s === 0 ? 1 : 0)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${autoScrollSpeed > 0 ? 'bg-brand text-white' : 'bg-dark-700 text-gray-300'}`}>
              {autoScrollSpeed > 0 ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
              <span>{autoScrollSpeed > 0 ? 'Pausar' : 'Autoscroll'}</span>
            </button>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="bg-dark-800 p-4 rounded-xl border border-brand/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Editar cifrado</h3>
            <div className="flex gap-2">
              <button onClick={handlePasteFromClipboard} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-gray-300 transition">
                <Copy size={14} /> Pegar
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.chords" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-gray-300 transition">
                <Upload size={14} /> Importar archivo
              </button>
            </div>
          </div>
          <textarea
            value={editedChords}
            onChange={(e) => setEditedChords(e.target.value)}
            placeholder="Pega o escribe los acordes aquí..."
            className="w-full h-64 bg-dark-900 border border-dark-600 rounded-lg p-4 font-mono text-gray-200 focus:outline-none focus:border-brand resize-none"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 bg-dark-800 p-4 md:p-8 rounded-xl shadow-inner min-h-[500px] relative`}>
          {loadingChords && (
            <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-brand">
              <Loader2 size={40} className="animate-spin mb-3" />
              <span className="font-medium animate-pulse">Generando cifrado con IA...</span>
            </div>
          )}
          
          {!displayChords && !loadingChords && !editMode && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400 mb-4">Esta canción no tiene cifrado todavía.</p>
              <div className="flex gap-3">
                <button onClick={() => { setEditedChords(''); setEditMode(true); }} className="bg-dark-700 hover:bg-dark-600 text-white px-6 py-2 rounded-lg font-medium transition">
                  Crear cifrado
                </button>
                {user && (
                  <button onClick={handleGenerateChords} className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-lg font-medium transition">
                    Generar con IA
                  </button>
                )}
              </div>
            </div>
          )}
          
          <pre style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }} className="font-mono whitespace-pre-wrap text-gray-200 overflow-x-auto font-medium">
            {displayChords}
          </pre>
        </div>

        {showComments && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-brand" />Opiniones</h3>
              
              {user ? (
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="¿Qué te parece este cifrado?" className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand resize-none" rows={3} maxLength={500} />
                  <p className="text-right text-xs text-gray-600 mt-1">{newComment.length}/500</p>
                  <button type="submit" disabled={!newComment.trim()} className="mt-2 w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition">
                    Publicar Opinión
                  </button>
                </form>
              ) : (
                <p className="text-gray-500 text-sm mb-4">Inicia sesión para opinar.</p>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">Sé el primero en opinar.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-dark-900 p-3 rounded-lg border border-dark-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-brand text-xs">{c.username}</span>
                        <span className="text-gray-600 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
};
