import type { BuildNote } from './types';

/**
 * Build notes. Newest first. A note earns its place by explaining a decision,
 * not by announcing that work happened.
 */
export const NOTES: BuildNote[] = [
  {
    slug: 'inspectable-density-fields',
    title: 'Making Hytale density fields inspectable',
    date: '2026-08-04',
    project: 'TerraNova',
    hook: 'Terrain you can see is not terrain you can debug. The numbers had to become readable.',
  },
  {
    slug: 'why-abridgd-avoids-an-infinite-feed',
    title: 'Why Abridgd avoids an infinite feed',
    date: '2026-07-22',
    project: 'Abridgd',
    hook: 'Local news is finite. An interface that pretends otherwise is lying about the day.',
  },
  {
    slug: 'local-first-data-model',
    title: 'Designing a local-first data model that survives being wrong',
    date: '2026-07-05',
    project: 'Void Ledger',
    hook: 'Local-first means the cache is the product. Getting the invalidation wrong is not a bug, it is a lie.',
  },
];

export function getNote(slug: string): BuildNote | undefined {
  return NOTES.find((note) => note.slug === slug);
}
