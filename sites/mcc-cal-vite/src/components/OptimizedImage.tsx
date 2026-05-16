import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from 'react';
import {
  getBlurPlaceholder,
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from '@/utils/imageOptimization';

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  frameClassName?: string;
  imageClassName?: string;
  optimizedWidth?: number;
  srcSetWidths?: number[];
};

type PlaceholderStyle = CSSProperties & {
  '--mcc-image-placeholder': string;
};

export default function OptimizedImage({
  src,
  alt,
  frameClassName,
  imageClassName,
  optimizedWidth,
  srcSetWidths,
  sizes,
  onLoad,
  ...imageProps
}: OptimizedImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loaded = loadedSrc === src;
  const optimizedSrc = useMemo(
    () => getOptimizedImageUrl(src, { width: optimizedWidth }),
    [optimizedWidth, src],
  );
  const srcSet = useMemo(
    () => getResponsiveImageSrcSet(src, srcSetWidths),
    [src, srcSetWidths],
  );
  const frameStyle = useMemo<PlaceholderStyle>(
    () => ({
      '--mcc-image-placeholder': `url("${getBlurPlaceholder(src)}")`,
    }),
    [src],
  );

  useEffect(() => {
    const img = imgRef.current;

    if (img?.complete && img.naturalWidth > 0) {
      setLoadedSrc(src);
    }
  }, [optimizedSrc, src]);

  return (
    <span className={frameClassName} data-loaded={loaded ? 'true' : 'false'} style={frameStyle}>
      <img
        ref={imgRef}
        {...imageProps}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={imageClassName}
        onLoad={(event) => {
          setLoadedSrc(src);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
