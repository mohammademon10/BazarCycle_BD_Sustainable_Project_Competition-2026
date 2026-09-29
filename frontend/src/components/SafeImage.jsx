import React, { useState } from 'react';

/**
 * SafeImage Component
 * Handles lazy loading, graceful fallback, zoom-on-hover, and accessibility.
 */
export default function SafeImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  aspectRatio = 'aspect-video',
  fallbackIconText = 'BazarCycle BD Sustainability Asset',
  zoomOnHover = true,
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-emerald-900 via-forest-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center text-emerald-100 rounded-lg overflow-hidden border border-emerald-800/40 ${aspectRatio} ${className}`}
        role="img"
        aria-label={alt || 'Sustainability Asset'}
      >
        <div className="w-12 h-12 mb-3 rounded-full bg-emerald-800/60 flex items-center justify-center text-emerald-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-emerald-200">{alt || fallbackIconText}</p>
        <span className="text-xs text-emerald-400/80 mt-1">BazarCycle BD Local Market Resource</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 rounded-lg ${aspectRatio} ${className} ${zoomOnHover ? 'img-zoom-container' : ''}`}>
      {/* Shimmer skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 shimmer" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        draggable="false"
      />
    </div>
  );
}
