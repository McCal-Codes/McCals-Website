/**
 * Podcast types
 */

export interface Episode {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  platformUrl?: string;
  audioUrl: string;
  image?: string;
  duration?: string;
  episodeNumber?: string;
  episodeType?: string;
  explicit?: boolean;
  transcripts?: EpisodeTranscript[];
}

export interface EpisodeTranscript {
  url: string;
  type: string;
  language?: string;
  rel?: string;
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
