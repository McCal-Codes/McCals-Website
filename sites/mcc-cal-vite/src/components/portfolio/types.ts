// Normalised internal types used by all portfolio components.
// Raw manifest shapes are adapted in useManifest.ts.

export interface PortfolioImage {
  url: string;
  filename: string;
  caption?: string;
  description?: string;
  alt?: string;
}

export interface PortfolioGroup {
  id: string;
  title: string;
  dateDisplay?: string;
  dateISO?: string;
  category?: string;
  tags?: string[];
  featuredRank?: number;
  featuredDescription?: string;
  featuredCover?: string;
  sourcePath?: string;
  /** Whether any image in this group has been published to an outlet */
  published?: boolean;
  outletName?: string;
  outletUrl?: string;
  articleUrl?: string;
  images: PortfolioImage[];
  /** First image in the group, used as the card cover */
  coverImage: PortfolioImage;
}

export type ManifestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseManifestResult<T> {
  data: T | null;
  status: ManifestStatus;
  error: string | null;
}
