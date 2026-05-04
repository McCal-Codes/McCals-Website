import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import styles from '@/pages/one-nation-divided.module.css';

type ImageWithErrorBoundaryProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
};

export function ImageWithErrorBoundary({
  src,
  width,
  height,
  alt,
  sizes,
  loading = 'lazy',
  className,
  fallback,
  onLoad,
  onError,
}: ImageWithErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const aspectStyle = {
    '--image-aspect': `${width} / ${height}`,
  } as CSSProperties;

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    const error = new Error(`Failed to load image: ${src}`);
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
    console.error('Image load error:', error);
  };

  if (hasError) {
    return (
      fallback || (
        <div className={styles.imageErrorFallback} style={aspectStyle}>
          <span>Image unavailable</span>
        </div>
      )
    );
  }

  return (
    <div className={styles.imageContainer} style={aspectStyle}>
      {isLoading && (
        <div className={styles.imageLoadingSkeleton} aria-hidden="true">
          <div className={styles.skeleton} />
        </div>
      )}
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading={loading}
        decoding="async"
        sizes={sizes}
        className={[className, isLoading ? styles.imageLoading : ''].filter(Boolean).join(' ')}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
