import { FC } from 'react';
import { ConcertImage } from '../../types/concertManifest';
export interface LightboxProps {
  images: ConcertImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}
declare const Lightbox: FC<LightboxProps>;
export default Lightbox;
