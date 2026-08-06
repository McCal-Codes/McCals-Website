import type { ActivityEntry } from './types';

/**
 * What is actually being worked on now. Short, specific, and worth updating often.
 * A stale "Currently" block is worse than no "Currently" block.
 */
export const ACTIVITY: ActivityEntry[] = [
  {
    project: 'TerraNova',
    slug: 'terranova',
    detail: 'Preparing Alpha 5 and refining preview accuracy.',
  },
  {
    project: 'Abridgd',
    slug: 'abridgd',
    detail: 'Reworking information architecture and offline behavior.',
  },
];
