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
        title: 'Alpha channel',
        detail: 'Preview accuracy and inspectable density fields.',
        current: true,
      },
      {
        marker: 'Void Ledger',
        date: 'In progress',
        title: 'Planning view',
        detail: 'Local inventory matching against trader stock. Nothing released yet.',
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
        marker: 'Abridgd',
        date: 'Paused',
        title: 'Information architecture and offline behaviour',
        detail: 'Offline behaviour and how the app reports it. Resumes when the app does.',
      },
      {
        marker: 'Abridgd',
        date: 'Late 2026 or early 2027',
        title: 'Android testing',
        detail:
          'Expo already builds for Android. Distributing there is a different skill, and I have not learned it yet. The date is an estimate.',
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
