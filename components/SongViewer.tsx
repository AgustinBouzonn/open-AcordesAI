import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, PlayCircle, PauseCircle, Type, Minus, Plus, Share2, Guitar, Music, Keyboard } from 'lucide-react';
import { Song, Comment, Instrument } from '../types';
import { isSongFavorite, toggleFavorite, addComment, getComments, MAX_COMMENT_LENGTH } from '../services/storageService';

interface SongViewerProps {
  song: Song;
  onInstrumentChange: (instrument: Instrument) => Promise<void>;
  isLoadingInstrument: boolean;
}

export const SongViewer: React.FC<SongViewerProps> = ({ song, onInstrumentChange, isLoadingInstrument }) => {
  const [isFav, setIsFav] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0); // 0 = off, 1-5 speed
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [activeInstrument, setActiveInstrument] = useState<Instrument>('guitar');
  
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsFav(isSongFavorite(song.id));
    setComments(getComments(song.id));
    setAutoScrollSpeed(0); // Reset scroll on new song
    
    // Default to guitar or whatever data we have, though usually we start with guitar
    setActiveInstrument('guitar'); 
  }, [song.id]);

  useEffect(() => {
    if (autoScrollSpeed > 0) {
      scrollInterval.current = setInterval(() => {
        window.scrollBy(0, 1);
      }, 50 / autoScrollSpeed);
    } else {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    }
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [autoScrollSpeed]);

  const handleToggleFav = () => {
    const newState = toggleFavorite(song.id);
    setIsFav(newState);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const added = addComment(song.id, newComment);
    setComments([added, ...comments]);
    setNewComment('');
  };

  const toggleScroll = () => {
    setAutoScrollSpeed(prev => (prev === 0 ? 1 : 0));
  };

  const switchInstrument = (inst: Instrument) => {
      if (inst === activeInstrument) return;
      setActiveInstrument(inst);
      onInstrumentChange(inst);
  };

  // Determine what content to show
  // 1. If loading, show placeholder (handled by parent mostly, but we can dim)
  // 2. If song has specific instrument content in memory, use it
  // 3. Fallback to main content if it matches context (logic handled in App)
  const contentToDisplay = song.chords?.[activeInstrument] || song.content;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Song Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-dark-700">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{song.title}</h1>
          <h2 className="text-brand text-lg font-medium">{song.artist}</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500 text-sm bg-dark-800 px-2 py-1 rounded border border-dark-700">
                Tono: <span className="text-white font-mono">{song.key}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleFav}
            className={`p-3 rounded-full transition ${isFav ? 'bg-brand text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
          >
            <Heart size={20} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button 
             onClick={() => setShowComments(!showComments)}
             className="p-3 rounded-full bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition relative"
          >
            <MessageSquare size={20} />
            {comments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {comments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Controls Bar: Instruments + Tools */}
      <div className="sticky top-20 md:top-24 z-30 bg-dark-800/95 backdrop-blur-md rounded-xl border border-dark-600 shadow-xl flex flex-col md:flex-row items-center justify-between p-2 gap-3">
        
        {/* Instrument Selector */}
        <div className="flex p-1 bg-dark-900 rounded-lg w-full md:w-auto">
            <button 
                onClick={() => switchInstrument('guitar')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeInstrument === 'guitar' ? 'bg-brand text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Guitar size={16} />
                <span>Guitarra</span>
            </button>
            <button 
                onClick={() => switchInstrument('ukulele')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeInstrument === 'ukulele' ? 'bg-brand text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Music size={16} />
                <span>Ukelele</span>
            </button>
            <button 
                onClick={() => switchInstrument('piano')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeInstrument === 'piano' ? 'bg-brand text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Keyboard size={16} />
                <span>Piano</span>
            </button>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4 px-2">
            <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 text-gray-400 hover:text-white"><Minus size={16} /></button>
            <Type size={18} className="text-brand" />
            <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-2 text-gray-400 hover:text-white"><Plus size={16} /></button>
            </div>
            
            <div className="w-px h-6 bg-dark-600 hidden md:block"></div>

            <button 
            onClick={toggleScroll}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${autoScrollSpeed > 0 ? 'bg-brand text-white' : 'bg-dark-700 text-gray-300'}`}
            >
            {autoScrollSpeed > 0 ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
            <span>{autoScrollSpeed > 0 ? 'Pausar' : 'Autoscroll'}</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chord Sheet */}
        <div className={`lg:col-span-2 bg-dark-800 p-4 md:p-8 rounded-xl shadow-inner min-h-[500px] relative`}>
          {isLoadingInstrument && (
              <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-brand">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-3"></div>
                  <span className="font-medium animate-pulse">Generando cifrado para {activeInstrument}...</span>
              </div>
          )}
          <pre 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            className="font-mono whitespace-pre-wrap text-gray-200 overflow-x-auto font-medium"
          >
            {contentToDisplay}
          </pre>
        </div>

        {/* Sidebar: Comments */}
        {showComments && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-brand" />
                Opiniones
              </h3>
              
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="¿Qué te parece este cifrado?"
                  maxLength={MAX_COMMENT_LENGTH}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-1 mb-2">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/{MAX_COMMENT_LENGTH}
                  </span>
                </div>
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="mt-2 w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition"
                >
                  Publicar Opinión
                </button>
              </form>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">Sé el primero en opinar.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-dark-900 p-3 rounded-lg border border-dark-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-brand text-xs">{c.user}</span>
                        <span className="text-gray-600 text-[10px]">{new Date(c.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};