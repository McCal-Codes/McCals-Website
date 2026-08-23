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
          'Hytale world generation is configured through JSON templates. The format is expressive, and it is also unforgiving: a template is a deeply nested description of noise fields, curve transforms, and terrain combinators, and nothing about reading it tells you what the terrain will look like.',
          'The practical workflow before TerraNova was to edit the JSON, restart a server, fly around, and guess at which number to change. Iteration cost was measured in minutes per attempt, which is high enough that most creators stop exploring and settle for whatever they got early.',
          'TerraNova is an offline desktop studio for that work. It is open source under LGPL-2.1, and it also exists as a mirror under the HyperSystems Development organisation.',
        ],
      },
      {
        id: 'problem',
        label: 'Problem',
        heading: 'Problem',
        kind: 'list',
        body: ['Three things make hand-authored worldgen templates hard, and they compound:'],
        items: [
          'The template is a graph, but JSON presents it as a tree. Nodes that feed several consumers appear once and are referenced by name, so the actual data flow is invisible in the file.',
          'Feedback is detached from the edit. The result of a change appears in a different process, after a restart, at a location you have to navigate to.',
          'Invalid templates fail late. A schema mistake surfaces as a server-side error well after the edit that caused it, with no pointer back to the offending node.',
        ],
      },
      {
        id: 'system',
        label: 'System',
        heading: 'System',
        kind: 'prose',
        body: [
          'TerraNova treats the template as what it already is: a directed graph. Noise generators, curve transforms, and terrain combinators are nodes; the connections between them are the data flow that JSON was hiding.',
          'Editing happens in the graph. The preview renders from the same graph, so the feedback loop closes inside one window, on one machine, with no server involved. Export writes the JSON, and the Bridge plugin hot-reloads it into a running Hytale server when you want to see it in place.',
          'Validation runs against the Hytale worldgen schema before export rather than after, so schema errors are attributable to a node while you are still looking at it.',
        ],
      },
      {
        id: 'interface',
        label: 'Interface',
        heading: 'Interface',
        kind: 'shots',
        body: [
          'The window is three panes: the graph you are editing, the terrain that graph produces, and the parameters of whatever is selected. Nothing is behind a mode switch, because the point is to see the cause and the effect at the same time.',
        ],
        shots: [
          {
            alt: 'TerraNova editor with the node graph, live terrain preview, and inspector visible at once.',
            width: 1600,
            height: 1000,
            caption: 'The editor. Graph, preview, and inspector share one window.',
            callouts: [
              { index: '01', label: 'Node graph', x: 26, y: 42 },
              { index: '02', label: 'Live preview', x: 66, y: 34 },
              { index: '03', label: 'Inspector', x: 88, y: 56 },
              { index: '04', label: 'Validation strip', x: 50, y: 88 },
            ],
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        heading: 'Architecture',
        kind: 'diagram',
        body: [
          'The editor is TypeScript in a Tauri shell. Generation and preview rendering are Rust, because the preview has to keep up with a parameter being dragged. Export and validation sit between them, and the Bridge plugin carries the result into a live server.',
        ],
        diagram: {
          description:
            'A five-stage pipeline. The node graph editor feeds the generation core, which feeds the preview renderer. The graph also feeds schema validation, which produces the JSON export, which the Bridge plugin hot-reloads into a running Hytale server.',
          nodes: [
            { id: 'graph', label: 'Node graph editor', note: 'TypeScript / Tauri' },
            { id: 'core', label: 'Generation core', note: 'Rust' },
            { id: 'preview', label: 'Preview renderer', note: 'Rust' },
            { id: 'validate', label: 'Schema validation', note: 'Pre-export' },
            { id: 'bridge', label: 'Bridge plugin', note: 'Hot-reload into a live server' },
          ],
          edgeLabels: ['graph state', 'height + density fields', 'export request', 'validated .json'],
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
        body: ['Known and accepted, as of the current alpha:'],
        items: [
          'The preview approximates. It is close enough to make decisions from, and it is not a substitute for loading the world.',
          'The Bridge plugin requires a server you control. There is no path for hot-reloading into a server you are only a player on.',
          'Very large graphs slow the editor before they slow generation. The bottleneck is graph layout, not terrain.',
          'Hytale itself is a moving target. Schema changes upstream can invalidate templates that were valid at export time.',
        ],
      },
      {
        id: 'next',
        label: 'Next',
        heading: 'Next milestone',
        kind: 'prose',
        body: [
          'The alpha channel is where the work is happening. The current thread is trusting the preview: narrowing the gap between the preview renderer and the generation core, and making density fields inspectable so the numbers behind a piece of terrain can be read directly rather than inferred from its shape.',
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
      // Set testFlightUrl to open enrolment. Until then this renders as coming
      // soon rather than as a button that goes nowhere.
      blurb:
        'Abridgd runs on iPhone through TestFlight. Testing it means reading Pittsburgh news on it for a week and telling me where it got in the way.',
      note: 'Pittsburgh coverage only, and iPhone only. Android is on the roadmap for late 2026 or early 2027.',
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
      'Work out what to buy before the trader arrives, on your own machine, with your own inventory. Nothing is uploaded anywhere.',
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

  {
    index: '04',
    slug: 'experiments',
    title: 'Other work',
    purpose: 'Smaller tools, mods, and publication software.',
    pitch:
      'Publication tooling for a literary magazine, and a Hytale worldgen mod about the uncanny valley.',
    status: 'research',
    meta: {
      type: 'Assorted',
      role: 'Developer',
      platform: ['Various'],
      started: '2024',
    },
    sections: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
