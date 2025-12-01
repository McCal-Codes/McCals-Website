import React, { useEffect } from 'react';
import { ConcertImage } from '../../types/concertManifest';
import styles from '../../styles/widgets/concertWidget.module.css';

export interface LightboxProps {
  images: ConcertImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  const img = images[index];

  return (
    <div className={styles.lightboxOverlay} tabIndex={-1}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
      <button className={styles.prevBtn} onClick={onPrev} disabled={index === 0} aria-label="Previous">&#8592;</button>
      <img src={img.src} alt={img.alt} className={styles.lightboxImage} />
      <button className={styles.nextBtn} onClick={onNext} disabled={index === images.length - 1} aria-label="Next">&#8594;</button>
      <div className={styles.lightboxInfo}>
        <span>{img.band}</span>
        <span>{img.date}</span>
      </div>
    </div>
  );
};

export default Lightbox;
