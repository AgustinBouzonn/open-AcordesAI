import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, PlayCircle, PauseCircle, Type, Minus, Plus, Loader2, Edit2, Save, X, Copy, Upload, Download, Share2, Star } from 'lucide-react';
import { Song, Comment } from '../types';
import { useAuth } from './AuthContext';
import { ImportModal } from './ImportModal';
import { ShareModal } from './ShareModal';
import { api } from '../services/apiClient';
import * as storage from '../services/storageService';

interface SongViewerProps {
  song: Song;
  onSongUpdated?: (song: Song) => void;
}

const TRANSPOSITIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INSTRUMENTS = [
  { id: 'guitar', name: 'Guitarra' },
  { id: 'ukulele', name: 'Ukulele' },
  { id: 'piano', name: 'Piano' },
];

const getSongRatingSummary = (song: Song): { average: string; count: number } | null => {
  const count = Number(song.rating_count ?? 0);
  if (!count) {
    return null;
  }

  const average =
    typeof song.rating === 'number'
      ? song.rating.toFixed(1)
      : typeof song.rating === 'string'
        ? song.rating
        : '0.0';

  return { average, count };
};

const getSongFavoriteState = (song: Song): boolean =>
  song.is_favorite === true || song.is_favorite === 'true' || song.is_favorite === 1 || song.is_favorite === '1';

export const SongViewer: React.FC<SongViewerProps> = ({ song, onSongUpdated }) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(() => getSongFavoriteState(song));
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
  const [userRating, setUserRating] = useState(() => Number(song.user_rating ?? 0));
  const [avgRating, setAvgRating] = useState<{ average: string; count: number } | null>(() => getSongRatingSummary(song));
  const [transpose, setTranspose] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [instrument, setInstrument] = useState('guitar');
  const [instrumentChords, setInstrumentChords] = useState<Record<string, string>>(() =>
    song.chords ? { guitar: song.chords } : {}
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transposeChords = (text: string, steps: number): string => {
    if (steps === 0) return text;
    const chords = text.match(/[A-G][#b]?/g) || [];
    let result = text;
    chords.forEach(chord => {
      let idx = TRANSPOSITIONS.indexOf(chord.replace('b', '#').replace(/##/g, '#'));
      if (idx === -1) return;
      idx = (idx + steps + 12) % 12;
      result = result.replace(chord, TRANSPOSITIONS[idx]);
    });
    return result;
  };

  useEffect(() => {
    setInstrumentChords(song.chords ? { guitar: song.chords } : {});
    setAutoScrollSpeed(0);
    setEditMode(false);
    setFeedback(null);
    setIsFav(getSongFavoriteState(song));
    setUserRating(Number(song.user_rating ?? 0));
    setAvgRating(getSongRatingSummary(song));
  }, [song.id, song.chords, song.is_favorite, song.rating, song.rating_count, song.user_rating]);

  useEffect(() => {
    const chords = instrumentChords[instrument] || '';
    setDisplayChords(transposeChords(chords, transpose));
    setEditedChords(chords);
  }, [instrument, instrumentChords, transpose]);

  useEffect(() => {
    loadComments();
  }, [song.id, user]);

  useEffect(() => {
    if (!user) {
      setIsFav(false);
      setUserRating(0);
      return;
    }

    if (song.is_favorite === undefined) {
      loadFavorites();
    }

    if (song.user_rating === undefined || song.rating === undefined || song.rating_count === undefined) {
      loadRating();
    }
  }, [song.id, song.is_favorite, song.rating, song.rating_count, song.user_rating, user]);

  useEffect(() => {
    if (instrumentChords[instrument] || editMode) {
      return;
    }

    let cancelled = false;

    storage.getCachedChords(song.id, instrument).then((result) => {
      if (cancelled || !result?.chords) {
        return;
      }

      setInstrumentChords((current) => {
        if (current[instrument]) {
          return current;
        }
        return { ...current, [instrument]: result.chords };
      });
    });

    return () => {
      cancelled = true;
    };
  }, [editMode, instrument, instrumentChords, song.id]);

  const loadRating = async () => {
    try {
      const [summary, mine] = await Promise.all([
        api.ratings.get(song.id),
        user ? api.ratings.getMine(song.id).catch(() => ({ score: null })) : Promise.resolve({ score: null }),
      ]);
      setAvgRating(summary);
      setUserRating(mine.score ?? 0);
    } catch {}
  };

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

  const handleRating = async (score: number) => {
    if (!user) return;
    setUserRating(score);
    try {
      await api.ratings.save(song.id, score);
      loadRating();
      setFeedback({ type: 'success', message: 'Puntuacion guardada.' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo guardar la puntuacion.') });
    }
  };

  const loadFavorites = async () => {
    if (!user) {
      setIsFav(false);
      return;
    }

    const favs = await storage.getFavorites();
    setIsFav(favs.some(f => f.id === song.id));
  };

  const loadComments = async () => {
    const c = await storage.getComments(song.id);
    setComments(c);
  };

  const handleToggleFav = async () => {
    if (!user) return;
    try {
      const newState = await storage.toggleFavorite(song.id);
      setIsFav(newState);
      setFeedback({ type: 'success', message: newState ? 'Agregada a favoritos.' : 'Quitada de favoritos.' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo actualizar favoritos.') });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmittingComment(true);
    try {
      const added = await storage.addComment(song.id, newComment);
      setComments([added, ...comments]);
      setNewComment('');
      setFeedback({ type: 'success', message: 'Comentario publicado.' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo publicar tu comentario.') });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleGenerateChords = async () => {
    setLoadingChords(true);
    setFeedback(null);
    try {
      const result = await storage.getChords(song.id, instrument);
      setInstrumentChords((current) => ({ ...current, [instrument]: result.chords }));
      if (onSongUpdated) {
        onSongUpdated({ ...song, chords: instrument === 'guitar' ? result.chords : song.chords });
      }
      setFeedback({ type: 'success', message: `Cifrado listo para ${INSTRUMENTS.find((item) => item.id === instrument)?.name || instrument}.` });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo generar el cifrado con IA.') });
    } finally {
      setLoadingChords(false);
    }
  };

  const handleSaveChords = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await storage.saveChords(song.id, editedChords, instrument);
      setInstrumentChords((current) => ({ ...current, [instrument]: editedChords }));
      setEditMode(false);
      if (onSongUpdated) {
        onSongUpdated({ ...song, chords: instrument === 'guitar' ? editedChords : song.chords });
      }
      setFeedback({ type: 'success', message: 'Cifrado guardado correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo guardar el cifrado.') });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedChords(instrumentChords[instrument] || '');
    setEditMode(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setEditedChords(text);
        setFeedback({ type: 'success', message: 'Archivo cargado en el editor.' });
      };
      reader.readAsText(file);
    }
  };

  const handleImport = (chords: string) => {
    setEditedChords(chords);
    setEditMode(true);
    setFeedback({ type: 'success', message: 'Cifrado importado. Revisa y guarda cuando quieras.' });
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

  const handleShare = async () => {
    setShowShare(true);
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
          <button onClick={handleShare} className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition">
            <Share2 size={20} />
          </button>
          <button onClick={handleToggleFav} disabled={!user} className={`p-3 rounded-full transition ${!user ? 'opacity-50 cursor-not-allowed' : isFav ? 'bg-brand text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
            <Heart size={20} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition relative">
            <MessageSquare size={20} />
            {comments.length > 0 && <span className="absolute -top-1 -right-1 bg-brand text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{comments.length}</span>}
          </button>
        </div>
      </div>

      <div className="sticky top-20 md:top-24 z-30 bg-dark-800/95 backdrop-blur-md rounded-xl border border-dark-600 shadow-xl p-3 gap-3 flex flex-col">
        {feedback && (
          <div className={`rounded-lg border px-3 py-2 text-sm ${
            feedback.type === 'error'
              ? 'border-red-700 bg-red-950/50 text-red-200'
              : 'border-emerald-700 bg-emerald-950/40 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)} className="text-current/80 hover:text-current">✕</button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
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
            <select 
              value={instrument} 
              onChange={(e) => setInstrument(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              {INSTRUMENTS.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 text-gray-400 hover:text-white"><Minus size={16} /></button>
            <Type size={18} className="text-brand" />
            <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-2 text-gray-400 hover:text-white"><Plus size={16} /></button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setTranspose(t => t - 1)} className="px-3 py-1 bg-dark-700 rounded-lg text-gray-300 hover:bg-dark-600">-1</button>
            <span className="text-sm text-gray-400 min-w-[60px] text-center">
              {transpose === 0 ? 'Original' : transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button onClick={() => setTranspose(t => t + 1)} className="px-3 py-1 bg-dark-700 rounded-lg text-gray-300 hover:bg-dark-600">+1</button>
          </div>

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
              <button onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setEditedChords(text);
                  setFeedback({ type: 'success', message: 'Texto pegado en el editor.' });
                } catch (error) {
                  setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo leer el portapapeles.') });
                }
              }} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-gray-300 transition">
                <Copy size={14} /> Pegar
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.chords" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-gray-300 transition">
                <Upload size={14} /> Importar
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
                  <button type="submit" disabled={!newComment.trim() || submittingComment} className="mt-2 w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition">
                    {submittingComment ? 'Publicando...' : 'Publicar Opinión'}
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
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        songId={song.id}
      />
    </div>
  );
};
