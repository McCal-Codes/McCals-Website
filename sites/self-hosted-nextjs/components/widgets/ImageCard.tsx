import React from 'react';
import { ConcertImage } from '../../types/concertManifest';
import styles from '../../styles/widgets/concertWidget.module.css';

export type ImageCardProps = {
  image: ConcertImage;
  onClick: () => void;
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick }) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.imageCard}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open image of ${image.band} from ${image.date}`}
    >
      <img src={image.src} alt={image.alt} className={styles.image} />
      <div className={styles.overlay}>
        <span className={styles.band}>{image.band}</span>
        <span className={styles.date}>{image.date}</span>
        {/* Add badges/tags if needed */}
      </div>
    </div>
  );
};

export default ImageCard;
