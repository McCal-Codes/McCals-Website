import { forwardRef, useState, type ImgHTMLAttributes } from 'react';

interface VercelImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  priority?: boolean;
  fallbackSrc?: string;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Vercel-optimized image component that uses Vercel's Image CDN
 * Automatically optimizes images for best performance
 */
const VercelImage = forwardRef<HTMLImageElement, VercelImageProps>(
  ({ 
    src, 
    alt, 
    width, 
    height, 
    quality = 80,
    format = 'auto',
    priority = false,
    fallbackSrc,
    className,
    loading,
    decoding,
    style,
    onError,
    onLoad,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Build Vercel Image CDN URL
    const buildVercelImageUrl = (originalSrc: string) => {
      // Handle different image URL formats
      
      // Case 1: Already absolute URLs (external images/CDN) - return as-is
      // These are already optimized or from external sources, so no Vercel optimization needed
      if (originalSrc.startsWith('http://') || originalSrc.startsWith('https://')) {
        return originalSrc;
      }
      
      // Case 2: Relative paths (local images) - apply Vercel optimization
      if (originalSrc.startsWith('/')) {
        const baseUrl = '/_vercel/image';
        const params = new URLSearchParams();
        
        if (width) params.set('width', width.toString());
        if (height) params.set('height', height.toString());
        if (quality) params.set('quality', quality.toString());
        if (format !== 'auto') params.set('format', format);
        
        const paramString = params.toString();
        return paramString ? `${baseUrl}?url=${encodeURIComponent(originalSrc)}&${paramString}` : `${baseUrl}?url=${encodeURIComponent(originalSrc)}`;
      }
      
      // Case 3: Filename only (portfolio images) - construct portfolio URL
      // Portfolio images are served from /images/Portfolios/
      const portfolioUrl = `/images/Portfolios/${originalSrc}`;
      const baseUrl = '/_vercel/image';
      const params = new URLSearchParams();
      
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      if (quality) params.set('quality', quality.toString());
      if (format !== 'auto') params.set('format', format);
      
      const paramString = params.toString();
      return paramString ? `${baseUrl}?url=${encodeURIComponent(portfolioUrl)}&${paramString}` : `${baseUrl}?url=${encodeURIComponent(portfolioUrl)}`;
    };

    const optimizedSrc = buildVercelImageUrl(src);
    const loadingStrategy = priority ? 'eager' : (loading || 'lazy');
    const decodingStrategy = priority ? 'sync' : (decoding || 'async');

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setImageError(true);
      onError?.(e);
    };

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setImageLoaded(true);
      onLoad?.(e);
    };

    // Determine which source to use
    const finalSrc = imageError && fallbackSrc ? fallbackSrc : optimizedSrc;

    return (
      <img
        ref={ref}
        src={finalSrc}
        alt={alt}
        className={className}
        loading={loadingStrategy}
        decoding={decodingStrategy}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          ...style,
          // Ensure proper aspect ratio if dimensions are provided
          ...(width && height ? { aspectRatio: `${width}/${height}` } : {}),
          // Add loading state styling
          ...(imageLoaded ? {} : { opacity: 0, transition: 'opacity 0.3s ease-in-out' }),
        }}
        {...props}
      />
    );
  }
);

VercelImage.displayName = 'VercelImage';

export default VercelImage;
