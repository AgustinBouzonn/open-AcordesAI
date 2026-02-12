import React from 'react';
import { Search as SearchIcon, Loader2, ChevronRight } from 'lucide-react';
import { SongSearchResult } from '../types';

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  searchResults: SongSearchResult[];
  isSearching: boolean;
  onLoadSong: (id: string, title?: string, artist?: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  searchResults,
  isSearching,
  onLoadSong
}) => {
  return (
    <div className="space-y-6">
       <div className="sticky top-0 bg-dark-900 z-10 py-2">
         <form onSubmit={onSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand"
              autoFocus
            />
            <SearchIcon className="absolute left-3 top-3.5 text-gray-500" size={20} />
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <Loader2 className="animate-spin text-brand" size={20} />
              </div>
            )}
          </form>
       </div>

       {searchResults.length > 0 ? (
         <div className="space-y-2">
           {searchResults.map((result) => (
             <div
                key={result.id}
                onClick={() => onLoadSong(result.id, result.title, result.artist)}
                className="bg-dark-800 hover:bg-dark-700 p-4 rounded-xl cursor-pointer border border-transparent hover:border-brand/30 transition flex justify-between items-center"
             >
               <div>
                 <h3 className="font-bold text-white">{result.title}</h3>
                 <p className="text-sm text-brand">{result.artist}</p>
               </div>
               <div className="bg-dark-900 p-2 rounded-full">
                 <ChevronRight size={16} className="text-gray-500" />
               </div>
             </div>
           ))}
         </div>
       ) : (
         !isSearching && (
           <div className="text-center text-gray-500 mt-20">
             <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
             <p>Busca tu canción favorita para ver los acordes.</p>
           </div>
         )
       )}
    </div>
  );
};
