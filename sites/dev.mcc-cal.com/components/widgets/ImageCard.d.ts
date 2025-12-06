import { FC } from 'react';
import { ConcertImage } from '../../types/concertManifest';
export interface ImageCardProps {
  image: ConcertImage;
  onClick: () => void;
}
declare const ImageCard: FC<ImageCardProps>;
export default ImageCard;
