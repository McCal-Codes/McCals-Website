/**
 * Podcast constants
 */

import type { Episode, FeaturedMeta } from './types';

export const PODCAST_IMAGE =
  'https://media.rss.com/cafeconnectpod/20250404_090408_d8a1a6cce833630a24064aedcd52e348.png';
export const FEED_URL = 'https://media.rss.com/cafeconnectpod/feed.xml';
export const SPOTIFY_SHOW = 'https://open.spotify.com/show/1GcE0Tt669WrdAOXz73w0S';
export const APPLE_SHOW = 'https://podcasts.apple.com/us/podcast/caffeinated-connections/id1806715605';
export const CALENDLY = 'https://calendly.com/cjmccar-mcc-cal/caffeinated_connections';
export const CACHE_KEY = 'podcast-feed-v2.4';
export const CACHE_TTL = 1000 * 60 * 30;
export const PAGE_SIZE = 6;

export const FEATURED: Record<string, FeaturedMeta> = {
  'ep9-austin-carns': { reason: 'Relatable founder chaos + tight storytelling; great first impression.' },
  'ep7-mark-palumbo': { reason: 'Actionable branding talk and pacing; easy on-ramp for new listeners.' },
  'ep6-kyle-archer':  { reason: "High energy and humor; shows the show's vibe quickly." },
};

export const FALLBACK: Episode[] = [
  {
    guid: 'ep9-austin-carns',
    title: 'Ep 9: Rundown BMW, but Sold as a Lambo with Austin Carns',
    description: 'A photojournalist and a commentator walk into a podcast and end up unpacking fear, ego, and why we are all just trying to make it through in one piece.',
    pubDate: '2025-10-24T14:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2289545',
    audioUrl: 'https://content.rss.com/episodes/323976/2289545/cafeconnectpod/2025_10_24_21_22_49_e18fed56-f3ef-4fa6-bb5a-4b17e2ee174e.mp3',
  },
  {
    guid: 'ep8-liam-sullivan',
    title: "Ep 8: Don't Read the Shampoo Bottle with Liam Sullivan",
    description: 'From political rallies to chicken thermometers, Caleb and Liam discover how far curiosity can really go and why it matters for creative work.',
    pubDate: '2025-09-12T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2205662',
    audioUrl: 'https://content.rss.com/episodes/323976/2205662/cafeconnectpod/2025_09_08_17_11_04_24f12b7f-1449-4895-ad9a-945e184d82b2.mp3',
  },
  {
    guid: 'ep7-mark-palumbo',
    title: 'Ep 7: Lessons in Leadership, Branding, and Balance with Mark Palumbo',
    description: 'Caleb sits down with Mark Palumbo to unpack post-grad chaos, creative hustle, and what it takes to build a personal brand without burning out.',
    pubDate: '2025-05-30T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2031736',
    audioUrl: 'https://content.rss.com/episodes/323976/2031736/cafeconnectpod/2025_05_30_13_38_51_d2969ad9-f774-4b5f-9f77-53ccb65872ed.mp3',
  },
  {
    guid: 'ep6-kyle-archer',
    title: 'Ep 6: Riding the Chaos Wave with Kyle Archer',
    description: 'Rubber ducks, euphoric poems, and authentic artistry. Caleb and Kyle talk boundaries, storytelling, and balancing chaos with clarity.',
    pubDate: '2025-05-16T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2030795',
    audioUrl: 'https://content.rss.com/episodes/323976/2030795/cafeconnectpod/2025_05_16_14_44_51_7ea1e6bd-7b33-4f03-9925-0c0b4a265631.mp3',
  },
  {
    guid: 'ep5-dream-the-heavy',
    title: 'Ep 5: Mic Drops and Monk Juice with Dream the Heavy',
    description: 'TK and Paul of Dream the Heavy dive into Pittsburgh art scenes, vulnerability, and the creative rituals that keep good chaos flowing.',
    pubDate: '2025-04-25T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/1990167',
    audioUrl: '',
  },
  {
    guid: 'ep4-collin-strachan',
    title: 'Ep 4: Grit, Gear & Going All In with Collin Strachan',
    description: 'Caleb and Collin explore filmmaking in wild places, client honesty, and the balance between technical skill and storytelling heart.',
    pubDate: '2025-04-18T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/1990129',
    audioUrl: '',
  },
];
