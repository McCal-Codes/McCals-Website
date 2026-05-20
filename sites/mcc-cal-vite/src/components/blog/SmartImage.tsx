/**
 * SmartImage component with fallback handling
 */

import { useState } from 'react';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/utils/imageOptimization';

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
  optimizedWidth?: number;
  sizes?: string;
  srcSetWidths?: number[];
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
  optimizedWidth,
  sizes,
  srcSetWidths,
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

  const optimizedSrc = getOptimizedImageUrl(currentSrc, { width: optimizedWidth });
  const responsiveSrcSet = getResponsiveImageSrcSet(currentSrc, srcSetWidths);

  return (
    <img
      src={optimizedSrc}
      srcSet={responsiveSrcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding={loading === 'eager' ? 'sync' : 'async'}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      onError={() => {
        setFailedSrc(currentSrc);
      }}
    />
  );
}
