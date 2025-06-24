import React, { useState } from 'react';
import { InfluencerPhoto } from '@/types/vote';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface InfluencerPhotoGalleryProps {
  photos: InfluencerPhoto[];
  className?: string;
  style?: React.CSSProperties;
}

const InfluencerPhotoGallery: React.FC<InfluencerPhotoGalleryProps> = ({ photos, className = '', style }) => {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;

  const prev = () => {
    setIndex(i => (i === 0 ? photos.length - 1 : i - 1));
    if ('vibrate' in navigator) navigator.vibrate(5);
  };
  const next = () => {
    setIndex(i => (i === photos.length - 1 ? 0 : i + 1));
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const current = photos[index];

  return (
    <div className={`relative w-full aspect-square rounded-xl overflow-hidden bg-secondary flex items-center justify-center ${className}`} style={style}>
      <OptimizedImage
        src={current.image_url}
        alt={current.description || 'Influencer photo'}
        className="w-full h-full object-cover transition-all duration-300"
        priority={index === 0}
        style={{ userSelect: 'none' }}
      />
      {/* Overlay description */}
      {current.description && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs rounded px-2 py-1 max-w-[90%] truncate pointer-events-none">
          {current.description}
        </div>
      )}
      {/* Left arrow */}
      {photos.length > 1 && (
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 z-10 
                     transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
          onClick={prev}
          aria-label="Previous photo"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 transition-transform duration-200 hover:-translate-x-0.5" />
        </button>
      )}
      {/* Right arrow */}
      {photos.length > 1 && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 z-10
                     transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
          onClick={next}
          aria-label="Next photo"
          type="button"
        >
          <ChevronRight className="w-5 h-5 transition-transform duration-200 hover:translate-x-0.5" />
        </button>
      )}
      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InfluencerPhotoGallery; 