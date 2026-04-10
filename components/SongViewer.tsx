import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, PlayCircle, PauseCircle, Type, Minus, Plus, Loader2, Edit2, Save, X, Copy, Upload, Download, Share2, Star } from 'lucide-react';
import { Song, Comment, RatingSummary, Instrument } from '../types';
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
const CHORD_TOKEN = /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:[#b](?:5|9|11|13))*(?:\/[A-G](?:#|b)?)?$/i;
const INSTRUMENTS = [
  { id: 'guitar', name: 'Guitarra' },
  { id: 'ukulele', name: 'Ukulele' },
  { id: 'piano', name: 'Piano' },
] as const;

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
  const [avgRating, setAvgRating] = useState<RatingSummary | null>(null);
  const [transpose, setTranspose] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transposeRoot = (root: string, steps: number): string => {
    const normalizedRoot = root.toUpperCase().replace('B#', 'C').replace('E#', 'F');
    const sharpRoot = normalizedRoot.endsWith('B') && normalizedRoot.length === 2
      ? `${normalizedRoot[0]}#`
      : normalizedRoot;
    let idx = TRANSPOSITIONS.indexOf(sharpRoot);
    if (idx === -1) {
      idx = TRANSPOSITIONS.indexOf(sharpRoot.replace('b', '#').replace(/##/g, '#'));
    }
    if (idx === -1) {
      return root;
    }
    return TRANSPOSITIONS[(idx + steps + 12) % 12];
  };

  const transposeChordToken = (token: string, steps: number): string => {
    const match = token.match(/^(\[|\()?([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?(\]|\))?$/i);
    if (!match) {
      return token;
    }

    const [, prefix, root, suffixWithoutBass, bass, closing] = match;
    const normalizedSuffix = bass ? suffixWithoutBass.replace(/\/$/, '') : suffixWithoutBass;
    const transposedBass = bass ? `/${transposeRoot(bass, steps)}` : '';
    return `${prefix}${transposeRoot(root, steps)}${normalizedSuffix}${transposedBass}${closing}`;
  };

  const isChordLine = (line: string): boolean => {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return false;
    }

    const chordTokens = tokens.filter((token) => {
      const cleaned = token.replace(/^[\[(]+|[\])]+$/g, '').replace(/[.,;:!?]+$/g, '');
      return CHORD_TOKEN.test(cleaned);
    });

    return chordTokens.length > 0 && chordTokens.length >= Math.ceil(tokens.length * 0.6);
  };

  const transposeChords = (text: string, steps: number): string => {
    if (steps === 0) return text;

    return text
      .split('\n')
      .map((line) => {
        const withInlineChords = line.replace(/\[([^[\]]+)\]/g, (fullMatch, token: string) => {
          return CHORD_TOKEN.test(token) ? `[${transposeChordToken(token, steps)}]` : fullMatch;
        });

        if (!isChordLine(withInlineChords)) {
          return withInlineChords;
        }

        return withInlineChords.replace(/(^|\s)(?:\[|\()?([A-G](?:#|b)?[^\s\]]*(?:\/[A-G](?:#|b)?)?)(?:\]|\))?(?=\s|$)/gi, (match, leading, token) => {
          const candidate = match.slice(leading.length);
          const cleaned = candidate.replace(/^[\[(]+|[\])]+$/g, '').replace(/[.,;:!?]+$/g, '');
          return CHORD_TOKEN.test(cleaned) ? `${leading}${transposeChordToken(candidate, steps)}` : match;
        });
      })
      .join('\n');
  };

  useEffect(() => {
    const chords = song.chords || '';
    setDisplayChords(transposeChords(chords, transpose));
    setEditedChords(song.chords || '');
    loadFavorites();
    loadComments();
    loadRating();
    setAutoScrollSpeed(0);
    setEditMode(false);
  }, [song.id]);

  useEffect(() => {
    setDisplayChords(transposeChords(editedChords || song.chords || '', transpose));
  }, [editedChords, song.chords, transpose]);

  useEffect(() => {
    if (instrument === 'guitar') {
      setEditedChords(song.chords || '');
      return;
    }

    if (!user || editMode) {
      return;
    }

    let cancelled = false;
    setLoadingChords(true);

    storage.getChords(song.id, instrument)
      .then((result) => {
        if (!cancelled) {
          setEditedChords(result.chords);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEditedChords('');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingChords(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editMode, instrument, song.chords, song.id, user]);

  const loadRating = async () => {
    try {
      const data = await api.ratings.get(song.id);
      setAvgRating(data);
    } catch {}
  };

  const handleRating = async (score: number) => {
    if (!user) return;
    setUserRating(score);
    try {
      await api.ratings.save(song.id, score);
      loadRating();
    } catch {}
  };

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
      const result = await storage.getChords(song.id, instrument);
      setDisplayChords(transposeChords(result.chords, transpose));
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
      await storage.saveChords(song.id, editedChords, instrument);
      setDisplayChords(transposeChords(editedChords, transpose));
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
    setEditedChords(song.chords || '');
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
                  <button key={star} disabled={!user} onClick={() => handleRating(star)} aria-label={`Calificar con ${star} estrellas`} title={`Calificar con ${star} estrellas`} className={`${!user ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none rounded-full'} transition`}>
                    <Star size={16} aria-hidden="true" className={star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-500'} />
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
          <button onClick={handleShare} aria-label="Compartir" title="Compartir" className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
            <Share2 size={20} aria-hidden="true" />
          </button>
          <button onClick={handleToggleFav} disabled={!user} aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"} title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"} className={`p-3 rounded-full transition focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${!user ? 'opacity-50 cursor-not-allowed' : isFav ? 'bg-brand text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
            <Heart size={20} aria-hidden="true" fill={isFav ? "currentColor" : "none"} />
          </button>
          <button onClick={() => setShowComments(!showComments)} aria-label={showComments ? "Ocultar opiniones" : "Mostrar opiniones"} title={showComments ? "Ocultar opiniones" : "Mostrar opiniones"} className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition relative focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
            <MessageSquare size={20} aria-hidden="true" />
            {comments.length > 0 && <span className="absolute -top-1 -right-1 bg-brand text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{comments.length}</span>}
          </button>
        </div>
      </div>

      <div className="sticky top-20 md:top-24 z-30 bg-dark-800/95 backdrop-blur-md rounded-xl border border-dark-600 shadow-xl p-3 gap-3 flex flex-col">
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
               onChange={(e) => setInstrument(e.target.value as Instrument)}
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
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} aria-label="Disminuir tamaño de fuente" title="Disminuir tamaño de fuente" className="p-2 text-gray-400 hover:text-white rounded-full focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"><Minus size={16} aria-hidden="true" /></button>
            <Type size={18} aria-hidden="true" className="text-brand" />
            <button onClick={() => setFontSize(s => Math.min(24, s + 2))} aria-label="Aumentar tamaño de fuente" title="Aumentar tamaño de fuente" className="p-2 text-gray-400 hover:text-white rounded-full focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"><Plus size={16} aria-hidden="true" /></button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setTranspose(t => t - 1)} aria-label="Bajar un semitono" title="Bajar un semitono" className="px-3 py-1 bg-dark-700 rounded-lg text-gray-300 hover:bg-dark-600 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">-1</button>
            <span aria-live="polite" className="text-sm text-gray-400 min-w-[60px] text-center">
              {transpose === 0 ? 'Original' : transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button onClick={() => setTranspose(t => t + 1)} aria-label="Subir un semitono" title="Subir un semitono" className="px-3 py-1 bg-dark-700 rounded-lg text-gray-300 hover:bg-dark-600 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">+1</button>
          </div>

          <div className="flex items-center gap-1">
            {autoScrollSpeed > 0 && (
              <>
                <button onClick={() => setAutoScrollSpeed(s => Math.max(1, s - 1))} aria-label="Reducir velocidad de autoscroll" title="Reducir velocidad de autoscroll" className="p-1 text-gray-400 hover:text-white rounded-full focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"><Minus size={13} aria-hidden="true" /></button>
                <span aria-live="polite" className="text-xs text-brand font-mono w-4 text-center">{autoScrollSpeed}</span>
                <button onClick={() => setAutoScrollSpeed(s => Math.min(5, s + 1))} aria-label="Aumentar velocidad de autoscroll" title="Aumentar velocidad de autoscroll" className="p-1 text-gray-400 hover:text-white rounded-full focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"><Plus size={13} aria-hidden="true" /></button>
              </>
            )}
            <button onClick={() => setAutoScrollSpeed(s => s === 0 ? 1 : 0)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${autoScrollSpeed > 0 ? 'bg-brand text-white' : 'bg-dark-700 text-gray-300'}`}>
              {autoScrollSpeed > 0 ? <PauseCircle size={16} aria-hidden="true" /> : <PlayCircle size={16} aria-hidden="true" />}
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
              <button onClick={async () => { const t = await navigator.clipboard.readText(); setEditedChords(t); }} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-gray-300 transition">
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
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        songId={song.id}
      />
    </div>
  );
};
