import type { Project } from './types';

/**
 * The project index. Array order is display order. The slug also keys into
 * `github.json`, so anything measurable (version, releases, languages, license,
 * last push) is pulled rather than written here.
 *
 * A project with an empty `sections` array renders as an index row with no
 * case-study link. That is the honest state for work that does not yet have a
 * written case study, and it avoids shipping a page of filler.
 */
export const PROJECTS: Project[] = [
  {
    index: '01',
    slug: 'terranova',
    title: 'TerraNova',
    purpose: 'An offline design studio for Hytale World Generation V2.',
    status: 'active-alpha',
    meta: {
      type: 'Desktop application',
      role: 'Developer',
      platform: ['Windows', 'macOS', 'Linux'],
      started: 'March 2026',
      frameworks: ['Tauri', 'Vite'],
    },
    preview: {
      alt: 'TerraNova node graph editor with a live terrain preview.',
      width: 1600,
      height: 1000,
      callouts: [],
    },
    sections: [],
  },

  {
    index: '02',
    slug: 'abridgd',
    title: 'Abridgd',
    purpose: 'A calm, local-first news reader for Pittsburgh.',
    status: 'beta',
    meta: {
      type: 'Mobile application',
      role: 'Developer / Product designer',
      // iOS-first, and iOS-only in distribution: builds ship through TestFlight.
      // Expo means it runs on Android, but nothing is published there.
      platform: ['iOS'],
      started: 'January 2026',
      frameworks: ['React Native', 'Expo'],
    },
    preview: {
      alt: 'Abridgd reading view showing a finite daily set of local stories.',
      width: 1200,
      height: 1500,
      callouts: [],
    },
    beta: {
      testFlightUrl: 'https://testflight.apple.com/join/W15tgNJY',
      // 100 is a self-imposed ceiling, not Apple's: a public link allows 10,000.
      // Maintained by hand from App Store Connect, the only place the count
      // exists. Update it when it moves; a stale number is worse than none.
      testers: { taken: 2, cap: 100 },
      blurb:
        'Abridgd runs on iPhone through TestFlight. Testing it means reading Pittsburgh news on it for a week and telling me where it got in the way.',
      note: 'Pittsburgh coverage only, and iPhone only. Android is planned for late 2026 or early 2027.',
    },
    sections: [],
  },

  {
    index: '03',
    slug: 'void-ledger',
    title: 'Void Ledger',
    purpose: 'Local-first Baro Ki’Teer planning for Warframe.',
    status: 'active-development',
    meta: {
      type: 'Desktop application',
      role: 'Developer',
      platform: ['Windows'],
      started: 'July 2026',
    },
    preview: {
      alt: 'Void Ledger planning view listing Baro Ki’Teer inventory against owned items.',
      width: 1600,
      height: 1000,
      callouts: [],
    },
    sections: [],
  },

];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
