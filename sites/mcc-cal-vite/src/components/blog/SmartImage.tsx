/**
 * SmartImage component with fallback handling
 */

import { useState, useEffect } from 'react';

interface SmartImageProps {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholderClassName?: string;
}

export default function SmartImage({
  src,
  fallbackSrc,
  alt,
  className,
  loading,
  fetchPriority,
  placeholderClassName,
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || null);
    setUsedFallback(false);
  }, [src, fallbackSrc]);

  if (!currentSrc) {
    return placeholderClassName ? <div className={placeholderClassName} /> : null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => {
        if (!usedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
          setCurrentSrc(fallbackSrc);
          setUsedFallback(true);
          return;
        }

        setCurrentSrc(null);
      }}
    />
  );
}
