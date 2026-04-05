/**
 * Podcast types
 */

export interface Episode {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  audioUrl: string;
  image?: string;
}

export interface FeaturedMeta {
  reason: string;
}

export interface PlayerState {
  playing: boolean;
  loading: boolean;
  currentTime: number;
  duration: number;
}
