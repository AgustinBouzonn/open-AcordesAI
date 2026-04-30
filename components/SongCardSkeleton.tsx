import React from 'react';

export const SongCardSkeleton: React.FC = () => (
  <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl animate-pulse" aria-hidden="true">
    <div className="flex items-center gap-4">
      <div className="w-[52px] h-[52px] rounded-lg bg-dark-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-dark-700 rounded w-3/4" />
        <div className="h-3 bg-dark-700 rounded w-1/2" />
      </div>
    </div>
  </div>
);

export const SongCardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => <SongCardSkeleton key={i} />)}
  </div>
);
