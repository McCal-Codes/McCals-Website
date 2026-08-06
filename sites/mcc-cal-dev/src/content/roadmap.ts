import type { TimelineEntry } from './types';

/**
 * Development roadmap.
 *
 * This deliberately did NOT carry over most of `sites/mcc-cal-vite/src/data/roadmap-data.ts`.
 * That file was a photography-business roadmap: service launches, client portals, marketplace
 * plans, and a set of AI features. None of it belongs in a technical publication, and the
 * vaguer entries ("Global expansion planning", "Maintain the highest quality standards")
 * are exactly the kind of claim this site is built to avoid.
 *
 * What survived is the software work that actually happened or is actually queued.
 */

export interface RoadmapGroup {
  id: string;
  label: string;
  summary: string;
  entries: TimelineEntry[];
}

export const ROADMAP: RoadmapGroup[] = [
  {
    id: 'shipped',
    label: 'Shipped',
    summary: 'Work that is done and in production.',
    entries: [
      {
        marker: '2026.04',
        date: 'April 2026',
        title: 'Photography site migrated to Vite and React',
        detail:
          'Moved off the legacy platform. Route-level code splitting, prerendered route metadata, and a build that runs in CI.',
      },
      {
        marker: '2026.04',
        date: 'April 2026',
        title: 'Portfolio manifest system',
        detail:
          'Generators turn image directories into manifests at build time, so galleries are derived from the files rather than hand-maintained.',
      },
      {
        marker: '2026.07',
        date: 'July 2026',
        title: 'Site audit and remediation',
        detail:
          'Nine issues found and fixed across one cycle, each with a regression guard. Canonical URLs, direct-load routing, and image sizing are now covered by tests.',
      },
      {
        marker: '2026.08',
        date: 'August 2026',
        title: 'Technical portfolio split out',
        detail:
          'Software work moved to its own publication at dev.mcc-cal.com rather than sharing the photography site.',
      },
    ],
  },
  {
    id: 'active',
    label: 'Active',
    summary: 'In progress now.',
    entries: [
      {
        marker: 'TerraNova',
        date: 'In progress',
        title: 'Alpha 5',
        detail: 'Preview accuracy and inspectable density fields.',
        current: true,
      },
      {
        marker: 'Abridgd',
        date: 'In progress',
        title: 'Information architecture and offline behavior',
        detail:
          'What is kept on device, what happens at the edge of a cached set, and how the app says so.',
        current: true,
      },
    ],
  },
  {
    id: 'queued',
    label: 'Queued',
    summary: 'Committed to, not yet started. Nothing here is a promise about a date.',
    entries: [
      {
        marker: 'Field Kit',
        date: 'Queued',
        title: 'Ingest safety model',
        detail:
          'Decide the guarantees before writing the tool: what it will never delete, and how it proves a copy landed.',
      },
      {
        marker: 'This site',
        date: 'Queued',
        title: 'Interface captures',
        detail:
          'Real product screenshots for the case studies, replacing the reserved preview frames.',
      },
    ],
  },
];
