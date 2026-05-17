import { memo } from 'react';
import type { GalleryPlacement } from '@/types/one-nation';
import { ImageWithErrorBoundary } from './ImageWithErrorBoundary';
import styles from '@/pages/one-nation-divided.module.css';

type GalleryFigureProps = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  sceneCaption: string;
  gallery: GalleryPlacement;
  field: { kicker: string; title: string };
  // Note: body property removed as it's not used in GalleryFigure
  sizes?: string;
  loading?: 'lazy' | 'eager';
  figureId?: string;
  credit?: string;
};

export const GalleryFigure = memo(function GalleryFigure({
  id,
  src,
  width,
  height,
  alt,
  sceneCaption,
  gallery,
  field,
  // Note: field.body is not used in this component
  sizes = '(min-width: 1120px) 1100px, (min-width: 700px) 50vw, calc(100vw - 2.5rem)',
  loading = 'lazy',
  figureId,
  credit,
}: GalleryFigureProps) {
  const orientationClass = height > width ? styles.galleryFigurePortrait : '';

  return (
    <figure
      key={id}
      id={figureId}
      className={[
        styles.galleryFigure,
        orientationClass,
        gallery.large ? styles.galleryFigureLarge : '',
        gallery.centered ? styles.galleryFigureCentered : '',
      ].filter(Boolean).join(' ')}
      role="group"
      aria-labelledby={`${figureId || id}-caption`}
    >
      <div className={styles.galleryImgWrap}>
        <ImageWithErrorBoundary
          src={src}
          width={width}
          height={height}
          alt={alt}
          sizes={sizes}
          loading={loading}
        />
      </div>
      <figcaption className={styles.galleryFigcaption} id={`${figureId || id}-caption`}>
        <span className={styles.galleryFigcaptionKicker}>{field.kicker}</span>
        <span className={styles.galleryFigcaptionTitle}>{field.title}</span>
        <p className={styles.gallerySceneCaption}>{sceneCaption}</p>
        <p className={styles.galleryCredit}>{credit || 'Photo by Caleb McCartney'}</p>
      </figcaption>
    </figure>
  );
});

export default GalleryFigure;
