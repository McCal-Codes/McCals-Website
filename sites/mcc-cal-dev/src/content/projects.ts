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
    pitch:
      'Build Hytale terrain by connecting nodes instead of editing JSON, and watch the world change as you drag the numbers. Works entirely offline.',
    audience: 'For Hytale world builders',
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
    sections: [
      {
        id: 'context',
        label: 'Context',
        heading: 'Context',
        kind: 'prose',
        body: [
          'Hytale world generation V2 is configured through JSON: density types, material providers, curves, patterns, positions, and props. Reading that file does not tell you what the terrain will look like.',
          'The workflow without it is to edit the JSON, load it on a server, look around, and guess at which number to change next.',
          'TerraNova is an offline desktop studio for that work: a visual node editor, a live terrain preview, and validated export, with no server involved. It is open source under LGPL-2.1.',
        ],
      },
      {
        id: 'problem',
        label: 'Problem',
        heading: 'Problem',
        kind: 'list',
        body: ['Three things make hand-authored worldgen templates hard, and they compound:'],
        items: [
          'Structure is hard to see. The relationships between parts of a generator are easier to follow as a diagram than as nesting.',
          'Feedback is detached from the edit. The result appears on a server, after a load, somewhere you have to travel to.',
          'Mistakes surface late, away from the edit that caused them.',
        ],
      },
      {
        id: 'system',
        label: 'System',
        heading: 'System',
        kind: 'prose',
        body: [
          'TerraNova treats the generator as a graph. Density types, curves, materials, and the rest become nodes, and the connections between them are the structure the JSON was hiding.',
          'Editing happens in the graph. The preview renders from the same graph, so the feedback loop closes inside one window, on one machine, with no server involved. Export writes an asset pack; Bridge then syncs the file you have open into a server mod folder, for iterating without exporting the whole pack again.',
          'Validation runs continuously rather than at export, so an error is attributable to the node that caused it while you are still looking at it.',
        ],
      },
      {
        id: 'interface',
        label: 'Interface',
        heading: 'Interface',
        kind: 'shots',
        body: [
          'The node editor covers the V2 type set, with auto-layout, a minimap, search, and undo history that names what it is undoing. Preview is a 2D heatmap with contour lines and cross-sections, or a 3D voxel heightfield.',
          'A comparison view puts before and after side by side, so an edit can be judged against what it replaced rather than from memory. Validation runs continuously, and errors appear as badges on the node that caused them.',
        ],
        shots: [
          {
            alt: 'TerraNova node editor with a live terrain preview.',
            width: 1600,
            height: 1000,
            caption: 'The editor.',
            // Callouts wait for a real capture. Numbering positions on an image
            // that does not exist would be inventing a layout.
            callouts: [],
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        heading: 'Architecture',
        kind: 'diagram',
        body: [
          'The editor is TypeScript in a Tauri shell. Density and volume evaluation run in web workers, and the Rust side carries noise, preview probing, schema handling, and Bridge.',
        ],
        diagram: {
          description:
            'A five-stage pipeline. The node graph editor feeds density and volume workers, which call into the Rust noise and preview-probe code. The graph also feeds continuous schema validation, and export writes an asset pack that Bridge can sync into a server mod folder.',
          nodes: [
            { id: 'graph', label: 'Node graph editor', note: 'TypeScript / React' },
            { id: 'workers', label: 'Density and volume workers', note: 'Web workers' },
            { id: 'core', label: 'Noise and preview probe', note: 'Rust, via Tauri' },
            { id: 'validate', label: 'Schema validation', note: 'Continuous' },
            { id: 'bridge', label: 'Export and Bridge sync', note: 'Into a server mod folder' },
          ],
          edgeLabels: ['graph state', 'sample requests', 'diagnostics', 'asset pack'],
        },
      },
      {
        id: 'development',
        label: 'Development',
        heading: 'Development history',
        kind: 'releases',
        body: [
          'Published releases, newest first. This list is pulled from the repository rather than written here, so it cannot drift from what actually shipped.',
        ],
      },
      {
        id: 'limitations',
        label: 'Limitations',
        heading: 'Limitations',
        kind: 'list',
        body: ['Known and documented, as of the current alpha:'],
        items: [
          'The macOS build is not signed with an Apple Developer certificate, so macOS blocks it on first launch and it has to be opened past the warning.',
          'Bridge syncs the file you have open, not the whole project. The full asset pack has to be exported at least once first.',
        ],
      },
    ],
  },

  {
    index: '02',
    slug: 'abridgd',
    title: 'Abridgd',
    purpose: 'A calm, local-first news reader for Pittsburgh.',
    pitch:
      'Read what happened in Pittsburgh today and reach the end of it. No infinite feed, no national stories crowding out the ones down the street.',
    audience: 'For Pittsburgh readers who want to catch up and stop',
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
    sections: [
      {
        id: 'context',
        label: 'Context',
        heading: 'Context',
        kind: 'prose',
        body: [
          'Local news apps inherited the infinite feed from social platforms, where the goal is to never end. Local news is the opposite: on any given day there is a finite amount of it. The day has a bottom, and reaching it is the point.',
          'It starts with one city. Coverage comes from Pittsburgh outlets: WESA, Kidsburgh, and the beats a city follows, including the Pirates, the Penguins, and Pitt.',
        ],
      },
      {
        id: 'problem',
        label: 'Problem',
        heading: 'Problem',
        kind: 'list',
        items: [
          'An infinite feed cannot tell you that you are caught up, so it never lets you stop deliberately.',
          'Ranking by engagement pushes local coverage under national coverage, because national stories always win on volume.',
          'Reading happens where there is no signal. An app that assumes otherwise breaks exactly when someone is trying to use it.',
        ],
      },
      {
        id: 'next',
        label: 'Next',
        heading: 'Where it stands',
        kind: 'prose',
        body: [
          'The current build is in TestFlight: real Pittsburgh feeds, saved articles, reading position, light and dark themes, reader controls. A working app, not a demo.',
          'Work is paused, which the commit history already shows. When it resumes, the open thread is offline behaviour: what is kept on device, what happens at the edge of a cached set, and how the app says so instead of failing quietly.',
        ],
      },
    ],
  },

  {
    index: '03',
    slug: 'void-ledger',
    title: 'Void Ledger',
    purpose: 'Local-first Baro Ki’Teer planning for Warframe.',
    pitch:
      'Plan what to buy before the trader arrives. Runs locally on Windows.',
    audience: 'For Warframe players who plan ahead',
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
