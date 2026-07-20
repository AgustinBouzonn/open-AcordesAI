import React, { memo } from 'react';
import { Music } from 'lucide-react';

interface ArtworkProps {
  url?: string;
  size?: number;
  className?: string;
}

export const Artwork: React.FC<ArtworkProps> = memo(({ url, size = 48, className = '' }) => {
  // ⚡ Bolt Performance Optimization: Memoized Artwork to prevent unnecessary re-renders in lists
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className={`rounded-lg object-cover shrink-0 ${className}`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size }} className={`bg-dark-900 rounded-lg flex items-center justify-center shrink-0 border border-dark-700 ${className}`}>
      <Music size={size * 0.45} className="text-brand" />
    </div>
  );
});
