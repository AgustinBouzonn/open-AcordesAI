import React from 'react';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import { SearchResult } from '../../types';
import { Artwork } from '../Artwork';

interface Props {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchResults: SearchResult[];
  hasUser: boolean;
  onResultClick: (result: SearchResult) => void;
  onCreateClick: () => void;
}

export const SearchPage: React.FC<Props> = ({ searchQuery, onSearchQueryChange, onSearch, isSearching, searchResults, hasUser, onResultClick, onCreateClick }) => (
  <div className="space-y-6">
    <div className="sticky top-0 bg-dark-900 z-10 py-2">
      <form onSubmit={onSearch} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
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
          <div key={idx} onClick={() => onResultClick(result)} className="bg-dark-800 hover:bg-dark-700 p-3 rounded-xl cursor-pointer border border-transparent hover:border-brand/30 transition flex items-center gap-3">
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
            <button onClick={onCreateClick} className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              Crear canción manualmente
            </button>
            <button onClick={onCreateClick} className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              Subir cifrado propio
            </button>
          </div>
        </div>
      )
    )}
  </div>
);
