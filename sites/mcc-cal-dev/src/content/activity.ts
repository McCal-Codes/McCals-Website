import type { ActivityEntry } from './types';

/**
 * What is actually being worked on now. Short, specific, and worth updating often.
 * A stale "Currently" block is worse than no "Currently" block.
 */
export const ACTIVITY: ActivityEntry[] = [
  {
    project: 'TerraNova',
    slug: 'terranova',
    detail: 'Working the alpha channel toward a preview you can trust, and making density fields inspectable.',
  },
  {
    project: 'Void Ledger',
    slug: 'void-ledger',
    detail: 'Building out the planning view against a local inventory. No releases cut yet.',
  },
];
