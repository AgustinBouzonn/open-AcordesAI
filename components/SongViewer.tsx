import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Heart, MessageSquare, Loader2, Edit2, Save, X, Copy, Upload, Download, Share2, Star, Maximize, FileText, ListMusic, Repeat, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Song, Comment, RatingSummary, Instrument } from '../types';
import { useAuth } from './AuthContext';
import { ImportModal } from './ImportModal';
import { ShareModal } from './ShareModal';
import { api } from '../services/apiClient';
import * as storage from '../services/storageService';
import { acquireWakeLock, releaseWakeLock } from '../services/wakeLock';
import { useToast } from './Toast';
import { ChordChart } from './ChordChart';
import { AddToSetlistModal } from './AddToSetlistModal';
import { YouTubePlayer } from './YouTubePlayer';
import { transposeChords } from '../services/chordTransposer';
import { TransportBar } from './songViewer/TransportBar';
import { PresentationOverlay } from './songViewer/PresentationOverlay';
import { usePracticeTracker } from './songViewer/usePracticeTracker';

interface SongViewerProps {
  song: Song;
  onSongUpdated?: (song: Song) => void;
}

const INSTRUMENTS = [
  { id: 'guitar', name: 'Guitarra' },
  { id: 'ukulele', name: 'Ukulele' },
  { id: 'piano', name: 'Piano' },
] as const;

export const SongViewer: React.FC<SongViewerProps> = ({ song, onSongUpdated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isFav, setIsFav] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingChords, setLoadingChords] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedChords, setEditedChords] = useState(song.chords || '');
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState<RatingSummary | null>(null);
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const [aiConfigured, setAiConfigured] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showAddToSetlist, setShowAddToSetlist] = useState(false);
  const [progressStatus, setProgressStatus] = useState<'learning' | 'learned' | null>(null);

  useEffect(() => {
    if (!user) { setProgressStatus(null); return; }
    api.progress.get(song.id).then(({ status }) => setProgressStatus(status)).catch(() => undefined);
  }, [song.id, user]);

  const setProgress = async (next: 'learning' | 'learned' | null) => {
    if (!user) return;
    const previous = progressStatus;
    setProgressStatus(next);
    try {
      if (next) await api.progress.set(song.id, next);
      else await api.progress.clear(song.id);
      showToast(next === 'learning' ? 'Marcada como "aprendiendo"' : next === 'learned' ? 'Marcada como aprendida' : 'Progreso reseteado', 'success');
    } catch {
      setProgressStatus(previous);
      showToast('No se pudo actualizar el progreso', 'error');
    }
  };
  const [loopRange, setLoopRange] = useState<{ top: number; bottom: number } | null>(null);
  const [selectionPrompt, setSelectionPrompt] = useState<{ top: number; bottom: number; x: number; y: number } | null>(null);

  useEffect(() => {
    api.config.get().then(c => setAiConfigured(c.aiConfigured)).catch(() => setAiConfigured(false));
  }, []);

  usePracticeTracker(song.id, !!user && !editMode);

  useEffect(() => {
    if (autoScrollSpeed <= 0) return;

    void acquireWakeLock();
    const intervalMs = Math.max(20, 110 - autoScrollSpeed * 18);
    scrollInterval.current = setInterval(() => {
      const before = window.scrollY;
      const viewportBottom = before + window.innerHeight;
      if (loopRange && viewportBottom >= loopRange.bottom) {
        window.scrollTo({ top: Math.max(0, loopRange.top - 60), behavior: 'auto' });
        return;
      }
      window.scrollBy({ top: 1, behavior: 'auto' });
      if (window.scrollY === before) setAutoScrollSpeed(0);
    }, intervalMs);

    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = null;
      }
      void releaseWakeLock();
    };
  }, [autoScrollSpeed, loopRange]);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim().length < 5) {
        setSelectionPrompt(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = rect.bottom + window.scrollY;
      setSelectionPrompt({ top, bottom, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY });
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedChords(song.chords || '');
    loadFavorites();
    loadComments();
    loadRating();
    setAutoScrollSpeed(0);
    setEditMode(false);
    setCapo(0);
    setTranspose(0);
  }, [song.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const baseChords = editedChords || song.chords || '';
  const displayChords = useMemo(
    () => transposeChords(baseChords, transpose - capo),
    [baseChords, transpose, capo],
  );

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
      showToast(`Rating de ${score} ★ guardado`, 'success');
    } catch {
      showToast('No se pudo guardar el rating', 'error');
    }
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

  const handleGenerateChords = useCallback(async () => {
    setLoadingChords(true);
    try {
      const result = await storage.getChords(song.id, instrument);
      setEditedChords(result.chords);
      if (onSongUpdated) {
        onSongUpdated({ ...song, chords: result.chords });
      }
    } catch (err) {
      console.error('Failed to generate chords:', err);
      showToast('No se pudo generar el cifrado con IA', 'error');
    } finally {
      setLoadingChords(false);
    }
  }, [song, instrument, onSongUpdated, showToast]);

  const handleSaveChords = useCallback(async () => {
    setSaving(true);
    try {
      await storage.saveChords(song.id, editedChords, instrument);
      setEditMode(false);
      if (onSongUpdated) {
        onSongUpdated({ ...song, chords: editedChords });
      }
      showToast('Cifrado guardado', 'success');
    } catch (err) {
      console.error('Failed to save chords:', err);
      showToast('No se pudo guardar el cifrado', 'error');
    } finally {
      setSaving(false);
    }
  }, [song, instrument, editedChords, onSongUpdated, showToast]);

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

  const handleExportPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 36;
      let cursorY = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(song.title, margin, cursorY);
      cursorY += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(110);
      doc.text(song.artist, margin, cursorY);
      cursorY += 24;
      doc.setTextColor(20);
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      const lineHeight = 13;
      const lines = displayChords.split('\n');
      for (const line of lines) {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line || ' ', margin, cursorY);
        cursorY += lineHeight;
      }
      doc.save(`${song.title} - ${song.artist}.pdf`);
      showToast('PDF descargado', 'success');
    } catch (e) {
      console.error('Failed to export PDF:', e);
      showToast('No se pudo exportar el PDF', 'error');
    }
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
              {user && (
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => setProgress(progressStatus === 'learning' ? null : 'learning')}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition ${progressStatus === 'learning' ? 'bg-yellow-900/40 border-yellow-700 text-yellow-200' : 'bg-dark-800 border-dark-700 text-gray-400 hover:bg-dark-700'}`}
                  >
                    <GraduationCap size={12} /> Aprendiendo
                  </button>
                  <button
                    onClick={() => setProgress(progressStatus === 'learned' ? null : 'learned')}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition ${progressStatus === 'learned' ? 'bg-emerald-900/40 border-emerald-700 text-emerald-200' : 'bg-dark-800 border-dark-700 text-gray-400 hover:bg-dark-700'}`}
                  >
                    <CheckCircle2 size={12} /> Sé tocarla
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleShare} aria-label="Compartir" title="Compartir" className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition">
            <Share2 size={20} aria-hidden="true" />
          </button>
          <button onClick={handleToggleFav} disabled={!user} aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"} title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"} className={`p-3 rounded-full transition ${!user ? 'opacity-50 cursor-not-allowed' : isFav ? 'bg-brand text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
            <Heart size={20} fill={isFav ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <button onClick={() => setShowComments(!showComments)} aria-expanded={showComments} aria-label={showComments ? "Ocultar comentarios" : "Mostrar comentarios"} title={showComments ? "Ocultar comentarios" : "Mostrar comentarios"} className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition relative">
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
                  <>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-dark-700 hover:bg-dark-600 text-gray-300" title="Descargar como .txt">
                      <Upload size={16} /> .txt
                    </button>
                    <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-dark-700 hover:bg-dark-600 text-gray-300" title="Descargar como PDF">
                      <FileText size={16} /> PDF
                    </button>
                    <button onClick={() => setPresentationMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-dark-700 hover:bg-dark-600 text-gray-300" title="Modo presentación (Esc para salir)">
                      <Maximize size={16} /> Presentación
                    </button>
                    {user && (
                      <button onClick={() => setShowAddToSetlist(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-dark-700 hover:bg-dark-600 text-gray-300" title="Agregar a una setlist">
                        <ListMusic size={16} /> Setlist
                      </button>
                    )}
                  </>
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

        <TransportBar
          fontSize={fontSize}
          onFontSize={setFontSize}
          transpose={transpose}
          onTranspose={setTranspose}
          capo={capo}
          onCapo={setCapo}
          autoScrollSpeed={autoScrollSpeed}
          onAutoScrollSpeed={setAutoScrollSpeed}
        />
      </div>

      {editMode && (
        <div className="bg-dark-800 p-4 rounded-xl border border-brand/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Editar cifrado</h3>
            <div className="flex gap-2">
              <button onClick={async () => { try { const t = await navigator.clipboard.readText(); setEditedChords(t); } catch { /* clipboard unavailable */ } }} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-gray-300 transition">
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

      <YouTubePlayer
        songId={song.id}
        initialUrl={song.youtubeUrl}
        canEdit={!!user && song.userId !== undefined && String(song.userId) === String(user.id)}
        onUrlChange={(url) => { if (onSongUpdated) onSongUpdated({ ...song, youtubeUrl: url ?? undefined }); }}
      />

      {displayChords && <ChordChart chords={displayChords} instrument={instrument} />}

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
                  aiConfigured ? (
                    <button onClick={handleGenerateChords} className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-lg font-medium transition">
                      Generar con IA
                    </button>
                  ) : (
                    <button onClick={() => setShowImport(true)} className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-lg font-medium transition">
                      Importar de otra web
                    </button>
                  )
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

      <AddToSetlistModal isOpen={showAddToSetlist} onClose={() => setShowAddToSetlist(false)} songId={song.id} />

      {selectionPrompt && !loopRange && (
        <button
          onClick={() => { setLoopRange({ top: selectionPrompt.top, bottom: selectionPrompt.bottom }); window.getSelection()?.removeAllRanges(); setSelectionPrompt(null); }}
          style={{ position: 'absolute', top: selectionPrompt.y + 6, left: selectionPrompt.x, transform: 'translateX(-50%)', zIndex: 30 }}
          className="bg-brand hover:bg-brand/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
        >
          <Repeat size={12} /> Loop esta sección
        </button>
      )}

      {loopRange && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-brand text-white text-sm px-4 py-2 rounded-full shadow-xl flex items-center gap-3">
          <Repeat size={14} /> Loop activo
          <button onClick={() => setLoopRange(null)} className="hover:opacity-80"><X size={14} /></button>
        </div>
      )}

      {presentationMode && (
        <PresentationOverlay
          title={song.title}
          artist={song.artist}
          chords={displayChords}
          fontSize={fontSize}
          onClose={() => setPresentationMode(false)}
        />
      )}
    </div>
  );
};
