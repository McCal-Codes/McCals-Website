/**
 * SmartImage component with fallback handling
 */

import { useState } from 'react';

interface SmartImageProps {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholderClassName?: string;
  width?: number;
  height?: number;
}

export default function SmartImage({
  src,
  fallbackSrc,
  alt,
  className,
  loading,
  fetchPriority,
  placeholderClassName,
  width,
  height,
}: SmartImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = src && failedSrc !== src
    ? src
    : fallbackSrc && failedSrc !== fallbackSrc
      ? fallbackSrc
      : null;

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
      width={width}
      height={height}
      onError={() => {
        setFailedSrc(currentSrc);
      }}
    />
  );
}
