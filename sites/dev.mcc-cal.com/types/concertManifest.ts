export interface ConcertImage {
  id: string;
  src: string;
  alt: string;
  band: string;
  date: string;
  tags?: string[];
}

export interface ConcertManifest {
  title: string;
  description?: string;
  images: ConcertImage[];
}
