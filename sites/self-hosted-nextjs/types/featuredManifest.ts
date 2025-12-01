export type FeaturedImage = string | { path: string; filename?: string };

export interface FeaturedItem {
  type?: 'Concert' | 'Events' | 'Journalism' | string;
  bandName?: string;
  eventName?: string;
  title?: string;
  name?: string;
  folderPath?: string; // varies by type
  dateDisplay?: string;
  dateISO?: string;
  date?: { iso?: string } | { year?: number; month?: number; day?: number; iso?: string };
  images?: FeaturedImage[];
  coverImage?: FeaturedImage;
}

export interface FeaturedManifest {
  version?: string;
  type?: string;
  generated?: string;
  totalItems?: number;
  totalImages?: number;
  items?: FeaturedItem[];
}
